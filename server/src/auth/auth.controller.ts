import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  Response,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Аутентификация')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiResponse({
    status: 201,
    description: 'Пользователь успешно зарегистрирован',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'uuid',
          email: 'user@example.com',
          gender: 'MALE',
          birthDate: '1990-01-01T00:00:00.000Z',
          height: 180,
          formulaType: 'MIFFLIN_ST_JEOR',
          activityLevelId: 'sedentary',
          roleId: 'user',
          role: {
            id: 'user',
            name: 'user',
            description: 'Обычный пользователь',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 409, description: 'Email уже существует' })
  async register(@Body() registerDto: RegisterDto, @Response() res) {
    const { access_token, refresh_token, user } =
      await this.authService.register(registerDto);

    // Устанавливаем refresh token в httpOnly cookie
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      // dev-friendly: lax; production: none (with secure=true)
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });

    return res.json({ access_token, user });
  }

  @Post('login')
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiResponse({
    status: 200,
    description: 'Успешный вход',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: 'uuid',
          email: 'user@example.com',
          role: {
            id: 'user',
            name: 'user',
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Неверный email или пароль' })
  async login(@Body() loginDto: LoginDto, @Response() res) {
    const { access_token, refresh_token, user } =
      await this.authService.login(loginDto);

    // Устанавливаем refresh token в httpOnly cookie
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });

    return res.json({ access_token, user });
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Обновление access токена' })
  @ApiResponse({
    status: 200,
    description: 'Токен успешно обновлен',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token не найден или невалиден',
  })
  async refresh(@Request() req, @Response() res) {
    const refreshToken = req.cookies['refresh_token'];

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    const { access_token, refresh_token } =
      await this.authService.refreshTokens(refreshToken);

    // Устанавливаем новый refresh token в httpOnly cookie
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    });

    return res.json({ access_token });
  }

  @Post('logout')
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({
    status: 200,
    description: 'Успешный выход',
    schema: {
      example: { message: 'Logged out successfully' },
    },
  })
  async logout(@Request() req, @Response() res) {
    const refreshToken = req.cookies['refresh_token'];

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    // Удаляем cookie
    res.clearCookie('refresh_token');

    return res.json({ message: 'Logged out successfully' });
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получить профиль текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Профиль пользователя',
    schema: {
      example: {
        id: 'uuid',
        email: 'user@example.com',
        gender: 'MALE',
        birthDate: '1990-01-01T00:00:00.000Z',
        height: 180,
        formulaType: 'MIFFLIN_ST_JEOR',
        activityLevelId: 'sedentary',
        roleId: 'user',
        role: {
          id: 'user',
          name: 'user',
          description: 'Обычный пользователь',
        },
        activityLevel: {
          id: 'sedentary',
          name: 'Сидячий образ жизни',
          coefficient: 1.2,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async getProfile(@Request() req) {
    return this.authService.validateUser(req.user.userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('check-role')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Проверить роль текущего пользователя' })
  @ApiResponse({
    status: 200,
    description: 'Информация о роли',
    schema: {
      example: {
        userId: 'uuid',
        roleId: 'user',
        role: {
          id: 'user',
          name: 'user',
          description: 'Обычный пользователь',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Не авторизован' })
  async checkRole(@Request() req) {
    return this.authService.checkUserRole(req.user.userId);
  }
}
