import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockResponse = () => {
    const res: any = {};
    res.cookie = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.clearCookie = jest.fn().mockReturnValue(res);
    res.status = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('должен установить refresh_token в cookie и вернуть access_token', async () => {
      const registerDto = {
        email: 'test@example.com',
        password: 'password123',
        gender: 'MALE' as any,
        birthDate: '1990-01-01',
        height: 180,
      };

      const mockServiceResponse = {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        user: {
          id: 'user-id-1',
          email: registerDto.email,
          gender: registerDto.gender,
          birthDate: new Date(registerDto.birthDate),
          height: registerDto.height,
        },
      };

      const res = mockResponse();
      mockAuthService.register.mockResolvedValue(mockServiceResponse);

      await controller.register(registerDto, res);

      expect(service.register).toHaveBeenCalledWith(registerDto);
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh_token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        }),
      );
      expect(res.json).toHaveBeenCalledWith({
        access_token: 'access_token',
        user: mockServiceResponse.user,
      });
    });
  });

  describe('login', () => {
    it('должен установить refresh_token в cookie и вернуть access_token', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const mockServiceResponse = {
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        user: {
          id: 'user-id-1',
          email: loginDto.email,
          gender: 'MALE',
          birthDate: new Date('1990-01-01'),
          height: 180,
        },
      };

      const res = mockResponse();
      mockAuthService.login.mockResolvedValue(mockServiceResponse);

      await controller.login(loginDto, res);

      expect(service.login).toHaveBeenCalledWith(loginDto);
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'refresh_token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        }),
      );
      expect(res.json).toHaveBeenCalledWith({
        access_token: 'access_token',
        user: mockServiceResponse.user,
      });
    });
  });

  describe('refresh', () => {
    it('должен прочитать refresh_token из cookie и вернуть новый access_token', async () => {
      const mockRequest = {
        cookies: {
          refresh_token: 'valid_refresh_token',
        },
      };

      const mockServiceResponse = {
        access_token: 'new_access_token',
        refresh_token: 'new_refresh_token',
      };

      const res = mockResponse();
      mockAuthService.refreshTokens.mockResolvedValue(mockServiceResponse);

      await controller.refresh(mockRequest, res);

      expect(service.refreshTokens).toHaveBeenCalledWith('valid_refresh_token');
      expect(res.cookie).toHaveBeenCalledWith(
        'refresh_token',
        'new_refresh_token',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        }),
      );
      expect(res.json).toHaveBeenCalledWith({
        access_token: 'new_access_token',
      });
    });

    it('должен вернуть 401 если refresh_token не найден в cookie', async () => {
      const mockRequest = {
        cookies: {},
      };

      const res = mockResponse();

      await controller.refresh(mockRequest, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Refresh token not found',
      });
      expect(service.refreshTokens).not.toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('должен удалить refresh_token из cookie и БД', async () => {
      const mockRequest = {
        cookies: {
          refresh_token: 'valid_refresh_token',
        },
      };

      const res = mockResponse();
      mockAuthService.logout.mockResolvedValue({
        message: 'Logged out successfully',
      });

      await controller.logout(mockRequest, res);

      expect(service.logout).toHaveBeenCalledWith('valid_refresh_token');
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });

    it('должен удалить cookie даже если токен не найден', async () => {
      const mockRequest = {
        cookies: {},
      };

      const res = mockResponse();

      await controller.logout(mockRequest, res);

      expect(service.logout).not.toHaveBeenCalled();
      expect(res.clearCookie).toHaveBeenCalledWith('refresh_token');
      expect(res.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });
  });

  describe('getProfile', () => {
    it('должен вызвать service.validateUser с userId из request', async () => {
      const mockRequest = {
        user: { userId: 'user-id-1' },
      };

      const mockUser = {
        id: 'user-id-1',
        email: 'test@example.com',
        gender: 'MALE',
        birthDate: new Date('1990-01-01'),
        height: 180,
        createdAt: new Date(),
      };

      mockAuthService.validateUser.mockResolvedValue(mockUser);

      const result = await controller.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
      expect(service.validateUser).toHaveBeenCalledWith('user-id-1');
    });
  });
});
