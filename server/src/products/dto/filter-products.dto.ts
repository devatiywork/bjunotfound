import { ApiProperty } from '@nestjs/swagger';
import { DataSource } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class FilterProductsDto {
  @ApiProperty({
    description: 'Номер страницы',
    example: 1,
    default: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Количество элементов на странице',
    example: 20,
    default: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Поиск по названию, описанию или бренду',
    example: 'молоко',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Фильтр по ID категории',
    example: 'uuid',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiProperty({
    description: 'Фильтр по массиву ID тегов',
    example: ['uuid1', 'uuid2'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];

  @ApiProperty({
    description: 'Минимальное количество калорий',
    example: 100,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minCalories?: number;

  @ApiProperty({
    description: 'Максимальное количество калорий',
    example: 500,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxCalories?: number;

  @ApiProperty({
    description: 'Минимальная цена',
    example: 50,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({
    description: 'Максимальная цена',
    example: 1000,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({
    description: 'Фильтр по источнику данных',
    enum: DataSource,
    example: DataSource.ADMIN,
    required: false,
  })
  @IsOptional()
  @IsEnum(DataSource)
  source?: DataSource;

  @ApiProperty({
    description: 'Фильтр по статусу верификации',
    example: true,
    required: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({
    description: 'Поле для сортировки',
    enum: ['name', 'calories', 'price', 'createdAt'],
    example: 'createdAt',
    default: 'createdAt',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?: 'name' | 'calories' | 'price' | 'createdAt' = 'createdAt';

  @ApiProperty({
    description: 'Порядок сортировки',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
