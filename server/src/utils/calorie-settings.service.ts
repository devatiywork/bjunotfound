import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CalorieSettingsCache {
  minCaloriesFemale: number;
  minCaloriesMale: number;
  maxDeficit: number;
  maxSurplus: number;
  caloriesPerKgFat: number;
  paceVeryFast: number;
  paceFast: number;
  paceModerate: number;
  paceComfortable: number;
  paceGainFast: number;
  paceGainModerate: number;
  paceGainComfortable: number;
}

export interface PaceConfig {
  id: string;
  label: string;
  deficit: number;
}

@Injectable()
export class CalorieSettingsService implements OnModuleInit {
  private settingsCache: CalorieSettingsCache | null = null;
  private lastCacheUpdate: Date | null = null;
  private readonly CACHE_TTL = 1000 * 60 * 60; // 1 час

  constructor(private prisma: PrismaService) {}

  async onModuleInit() {
    // Загружаем настройки при старте приложения
    await this.loadSettings();
  }

  /**
   * Загрузка всех настроек из БД в кэш
   */
  private async loadSettings(): Promise<void> {
    const settings = await this.prisma.calorieSetting.findMany();

    const settingsMap = new Map<string, number>();
    settings.forEach((s) => settingsMap.set(s.key, s.value));

    this.settingsCache = {
      minCaloriesFemale: settingsMap.get('min_calories_female') || 1200,
      minCaloriesMale: settingsMap.get('min_calories_male') || 1500,
      maxDeficit: settingsMap.get('max_deficit') || 1000,
      maxSurplus: settingsMap.get('max_surplus') || 500,
      caloriesPerKgFat: settingsMap.get('calories_per_kg_fat') || 7700,
      paceVeryFast: settingsMap.get('pace_very_fast') || 1000,
      paceFast: settingsMap.get('pace_fast') || 750,
      paceModerate: settingsMap.get('pace_moderate') || 500,
      paceComfortable: settingsMap.get('pace_comfortable') || 300,
      paceGainFast: settingsMap.get('pace_gain_fast') || 500,
      paceGainModerate: settingsMap.get('pace_gain_moderate') || 350,
      paceGainComfortable: settingsMap.get('pace_gain_comfortable') || 200,
    };

    this.lastCacheUpdate = new Date();
    console.log('✓ Настройки калорий загружены в кэш');
  }

  /**
   * Проверка актуальности кэша
   */
  private isCacheValid(): boolean {
    if (!this.settingsCache || !this.lastCacheUpdate) {
      return false;
    }

    const now = new Date();
    const timeDiff = now.getTime() - this.lastCacheUpdate.getTime();
    return timeDiff < this.CACHE_TTL;
  }

  /**
   * Получение всех настроек (с автоматическим обновлением кэша)
   */
  async getSettings(): Promise<CalorieSettingsCache> {
    if (!this.isCacheValid()) {
      await this.loadSettings();
    }

    if (!this.settingsCache) {
      throw new Error('Не удалось загрузить настройки калорий');
    }

    return this.settingsCache;
  }

  /**
   * Получение конфигураций темпа для похудения
   */
  async getWeightLossPaceConfigs(): Promise<PaceConfig[]> {
    const settings = await this.getSettings();

    return [
      {
        id: 'very-fast',
        label: 'Очень быстрый',
        deficit: settings.paceVeryFast,
      },
      { id: 'fast', label: 'Быстрый', deficit: settings.paceFast },
      { id: 'moderate', label: 'Средний', deficit: settings.paceModerate },
      {
        id: 'comfortable',
        label: 'Комфортный',
        deficit: settings.paceComfortable,
      },
    ];
  }

  /**
   * Получение конфигураций темпа для набора веса
   */
  async getWeightGainPaceConfigs(): Promise<PaceConfig[]> {
    const settings = await this.getSettings();

    return [
      { id: 'fast', label: 'Быстрый', deficit: settings.paceGainFast },
      {
        id: 'moderate',
        label: 'Средний',
        deficit: settings.paceGainModerate,
      },
      {
        id: 'comfortable',
        label: 'Комфортный',
        deficit: settings.paceGainComfortable,
      },
    ];
  }

  /**
   * Обновление конкретной настройки
   */
  async updateSetting(key: string, value: number): Promise<void> {
    // Преобразуем camelCase в snake_case для поиска в БД
    const dbKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

    // Проверяем существование настройки
    const existing = await this.prisma.calorieSetting.findUnique({
      where: { key: dbKey },
    });

    if (!existing) {
      throw new Error(
        `Настройка с ключом "${key}" (БД: "${dbKey}") не найдена`,
      );
    }

    await this.prisma.calorieSetting.update({
      where: { key: dbKey },
      data: { value },
    });

    // Инвалидируем кэш
    this.settingsCache = null;
    this.lastCacheUpdate = null;

    console.log(`✓ Настройка "${dbKey}" обновлена до ${value}`);
  }

  /**
   * Принудительное обновление кэша
   */
  async refreshCache(): Promise<void> {
    await this.loadSettings();
  }

  /**
   * Сброс всех настроек к значениям по умолчанию
   */
  async resetToDefaults(): Promise<{ count: number }> {
    const defaultSettings = [
      { key: 'min_calories_female', value: 1200 },
      { key: 'min_calories_male', value: 1500 },
      { key: 'max_deficit', value: 1000 },
      { key: 'max_surplus', value: 500 },
      { key: 'pace_very_fast', value: 1 },
      { key: 'pace_fast', value: 0.75 },
      { key: 'pace_moderate', value: 0.5 },
      { key: 'pace_comfortable', value: 0.25 },
      { key: 'pace_gain_fast', value: 0.5 },
      { key: 'pace_gain_moderate', value: 0.35 },
      { key: 'pace_gain_comfortable', value: 0.25 },
      { key: 'calories_per_kg_fat', value: 7700 },
    ];

    // Обновляем все настройки
    await Promise.all(
      defaultSettings.map((setting) =>
        this.prisma.calorieSetting.update({
          where: { key: setting.key },
          data: { value: setting.value },
        }),
      ),
    );

    // Инвалидируем кэш
    this.settingsCache = null;
    this.lastCacheUpdate = null;

    console.log('✓ Все настройки калорий сброшены к значениям по умолчанию');

    return { count: defaultSettings.length };
  }
}
