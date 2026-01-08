import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let prisma: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prisma = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('должен зарегистрировать нового пользователя с дефолтными значениями', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        gender: 'MALE' as any,
        birthDate: '1990-01-01',
        height: 180,
      };

      const hashedPassword = 'hashed_password';
      const mockUser = {
        id: 'user-id-1',
        email: registerDto.email,
        password: hashedPassword,
        gender: registerDto.gender,
        birthDate: new Date(registerDto.birthDate),
        height: registerDto.height,
        formulaType: 'MIFFLIN_ST_JEOR',
        activityLevelId: 'sedentary',
        activityLevel: {
          id: 'sedentary',
          name: 'Сидячий образ жизни',
          description: 'Минимальная физическая активность, сидячая работа',
          coefficient: 1.2,
        },
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      mockPrismaService.user.create.mockResolvedValue(mockUser);
      mockJwtService.sign
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: 'token-id-1',
        userId: mockUser.id,
        token: 'refresh_token',
        expiresAt: new Date(),
      });

      const tokensPromise = Promise.resolve({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
      jest
        .spyOn(service as any, 'generateTokens')
        .mockReturnValue(tokensPromise);

      const result = await service.register(registerDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(registerDto.email);
      expect(result.user.formulaType).toBe('MIFFLIN_ST_JEOR');
      expect(result.user.activityLevelId).toBe('sedentary');
      expect(result.user.activityLevel).toBeDefined();
      expect(result.user.activityLevel.coefficient).toBe(1.2);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: registerDto.email },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('должен выбросить ConflictException если email уже существует', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        gender: 'MALE' as any,
        birthDate: '1990-01-01',
        height: 180,
      };

      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: registerDto.email,
      });

      await expect(service.register(registerDto)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('должен войти с валидными данными', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockUser = {
        id: 'user-id-1',
        email: loginDto.email,
        password: 'hashed_password',
        gender: 'MALE',
        birthDate: new Date('1990-01-01'),
        height: 180,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: 'token-id-1',
        userId: mockUser.id,
        token: 'refresh_token',
        expiresAt: new Date(),
      });

      const tokensPromise = Promise.resolve({
        access_token: 'access_token',
        refresh_token: 'refresh_token',
      });
      jest
        .spyOn(service as any, 'generateTokens')
        .mockReturnValue(tokensPromise);

      const result = await service.login(loginDto);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(result).toHaveProperty('user');
      expect(result.user.email).toBe(loginDto.email);
      expect(bcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
    });

    it('должен выбросить UnauthorizedException если пользователь не найден', async () => {
      const loginDto = {
        email: 'nonexistent@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('должен выбросить UnauthorizedException если пароль неверный', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const mockUser = {
        id: 'user-id-1',
        email: loginDto.email,
        password: 'hashed_password',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('refreshTokens', () => {
    it('должен обновить токены с валидным refresh token', async () => {
      const refreshToken = 'valid_refresh_token';
      const mockStoredToken = {
        id: 'token-id-1',
        token: refreshToken,
        userId: 'user-id-1',
        expiresAt: new Date(Date.now() + 86400000), // +1 день
        user: {
          id: 'user-id-1',
          email: 'test@example.com',
        },
      };

      mockPrismaService.refreshToken.findUnique.mockResolvedValue(
        mockStoredToken,
      );
      mockJwtService.verify.mockReturnValue({ sub: 'user-id-1' });
      mockPrismaService.refreshToken.delete.mockResolvedValue(mockStoredToken);
      mockJwtService.sign
        .mockReturnValueOnce('new_access_token')
        .mockReturnValueOnce('new_refresh_token');
      mockPrismaService.refreshToken.create.mockResolvedValue({
        id: 'token-id-2',
        userId: 'user-id-1',
        token: 'new_refresh_token',
        expiresAt: new Date(),
      });

      const result = await service.refreshTokens(refreshToken);

      expect(result).toHaveProperty('access_token');
      expect(result).toHaveProperty('refresh_token');
      expect(prisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: mockStoredToken.id },
      });
    });

    it('должен выбросить UnauthorizedException если токен не найден в БД', async () => {
      mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);

      await expect(service.refreshTokens('invalid_token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('должен выбросить UnauthorizedException если токен истек', async () => {
      const mockStoredToken = {
        id: 'token-id-1',
        token: 'expired_token',
        userId: 'user-id-1',
        expiresAt: new Date(Date.now() - 86400000), // -1 день
        user: {
          id: 'user-id-1',
          email: 'test@example.com',
        },
      };

      mockPrismaService.refreshToken.findUnique.mockResolvedValue(
        mockStoredToken,
      );
      mockPrismaService.refreshToken.delete.mockResolvedValue(mockStoredToken);

      await expect(service.refreshTokens('expired_token')).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prisma.refreshToken.delete).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('должен выйти и удалить refresh token', async () => {
      const refreshToken = 'valid_refresh_token';

      mockPrismaService.refreshToken.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.logout(refreshToken);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(prisma.refreshToken.deleteMany).toHaveBeenCalledWith({
        where: { token: refreshToken },
      });
    });
  });

  describe('validateUser', () => {
    it('должен вернуть данные пользователя', async () => {
      const userId = 'user-id-1';
      const mockUser = {
        id: userId,
        email: 'test@example.com',
        gender: 'MALE',
        birthDate: new Date('1990-01-01'),
        height: 180,
        createdAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateUser(userId);

      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          gender: true,
          birthDate: true,
          height: true,
          createdAt: true,
        },
      });
    });
  });
});
