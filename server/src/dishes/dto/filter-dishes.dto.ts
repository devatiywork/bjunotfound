import { ApiProperty } from '@nestjs/swagger';
import {
  CuisineType,
  DataSource,
  DifficultyLevel,
  DishCategory,
  MealType,
} from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class FilterDishesDto {
  @ApiProperty({
    description: 'Номер страницы',
    example: 1,
    required: false,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Количество блюд на странице',
    example: 20,
    required: false,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Поиск по названию или описанию',
    example: 'салат',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Фильтр по тегам (массив UUID)',
    example: ['uuid-тега-1', 'uuid-тега-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];

  @ApiProperty({
    description: 'Тип приема пищи',
    enum: MealType,
    required: false,
  })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;

  @ApiProperty({
    description: 'Тип кухни',
    enum: CuisineType,
    required: false,
  })
  @IsOptional()
  @IsEnum(CuisineType)
  cuisineType?: CuisineType;

  @ApiProperty({
    description: 'Категория блюда',
    enum: DishCategory,
    required: false,
  })
  @IsOptional()
  @IsEnum(DishCategory)
  dishCategory?: DishCategory;

  @ApiProperty({
    description: 'Сложность приготовления',
    enum: DifficultyLevel,
    required: false,
  })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @ApiProperty({
    description: 'Минимальное количество калорий на порцию',
    example: 200,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minCalories?: number;

  @ApiProperty({
    description: 'Максимальное количество калорий на порцию',
    example: 500,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxCalories?: number;

  @ApiProperty({
    description: 'Минимальное время приготовления в минутах',
    example: 15,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minCookingTime?: number;

  @ApiProperty({
    description: 'Максимальное время приготовления в минутах',
    example: 60,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxCookingTime?: number;

  @ApiProperty({
    description: 'Минимальная цена блюда',
    example: 100,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: 'Максимальная цена блюда',
    example: 1000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    description: 'Источник данных',
    enum: DataSource,
    required: false,
  })
  @IsOptional()
  @IsEnum(DataSource)
  source?: DataSource;

  @ApiProperty({
    description: 'Только верифицированные блюда',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({
    description: 'Поле для сортировки',
    enum: [
      'name',
      'caloriesPerServing',
      'pricePerServing',
      'cookingTimeMinutes',
      'createdAt',
    ],
    example: 'createdAt',
    required: false,
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Порядок сортировки',
    enum: ['asc', 'desc'],
    example: 'desc',
    required: false,
    default: 'desc',
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
