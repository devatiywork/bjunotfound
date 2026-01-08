import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CalorieSettingsService } from '../utils/calorie-settings.service';
import { UpdateSettingDto } from '../utils/dto/update-setting.dto';

@Controller('admin/settings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class CalorieSettingsController {
  constructor(
    private readonly calorieSettingsService: CalorieSettingsService,
  ) {}

  /**
   * GET /admin/settings
   * Получить все настройки калорий
   */
  @Get()
  async getAllSettings() {
    const settings = await this.calorieSettingsService.getSettings();
    return settings;
  }

  /**
   * PATCH /admin/settings/:key
   * Обновить конкретную настройку
   */
  @Patch(':key')
  async updateSetting(
    @Param('key') key: string,
    @Body() updateSettingDto: UpdateSettingDto,
  ) {
    await this.calorieSettingsService.updateSetting(
      key,
      updateSettingDto.value,
    );

    return {
      message: `Настройка "${key}" обновлена`,
      key,
      value: updateSettingDto.value,
    };
  }

  /**
   * POST /admin/settings/refresh-cache
   * Принудительно обновить кэш настроек
   */
  @Post('refresh-cache')
  async refreshCache() {
    await this.calorieSettingsService.refreshCache();

    return {
      message: 'Кэш настроек обновлен',
    };
  }

  /**
   * POST /admin/settings/reset
   * Сбросить все настройки к значениям по умолчанию
   */
  @Post('reset')
  async resetSettings() {
    const result = await this.calorieSettingsService.resetToDefaults();

    return {
      message: 'Настройки сброшены к значениям по умолчанию',
      count: result.count,
    };
  }
}
