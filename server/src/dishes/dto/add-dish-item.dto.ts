import { ApiProperty } from '@nestjs/swagger';
import { MeasureType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

/**
 * DTO для добавления ингредиента в блюдо
 */
export class AddDishItemDto {
  @ApiProperty({
    description: 'ID пользовательского продукта',
    example: 'uuid',
  })
  @IsString()
  @IsNotEmpty()
  productUserId: string;

  @ApiProperty({
    description: 'Тип измерения ингредиента',
    enum: MeasureType,
    example: MeasureType.GRAMS,
  })
  @IsEnum(MeasureType)
  measureType: MeasureType;

  // Граммы (только для GRAMS)
  @ApiProperty({
    description: 'Количество в граммах (только для measureType = GRAMS)',
    example: 100,
    required: false,
    minimum: 1,
  })
  @ValidateIf((o) => o.measureType === MeasureType.GRAMS)
  @IsInt()
  @Min(1)
  amountG?: number;

  // Миллилитры (только для MILLILITERS)
  @ApiProperty({
    description:
      'Количество в миллилитрах (только для measureType = MILLILITERS)',
    example: 250,
    required: false,
    minimum: 1,
  })
  @ValidateIf((o) => o.measureType === MeasureType.MILLILITERS)
  @IsInt()
  @Min(1)
  amountMl?: number;

  // ID порции (только для SERVINGS)
  @ApiProperty({
    description: 'ID порции продукта (только для measureType = SERVINGS)',
    example: 'uuid',
    required: false,
  })
  @ValidateIf((o) => o.measureType === MeasureType.SERVINGS)
  @IsString()
  @IsNotEmpty()
  servingId?: string;

  // Количество порций (только для SERVINGS)
  @ApiProperty({
    description: 'Количество порций (только для measureType = SERVINGS)',
    example: 4,
    required: false,
    minimum: 0.01,
  })
  @ValidateIf((o) => o.measureType === MeasureType.SERVINGS)
  @IsNumber()
  @Min(0.01)
  servingsCount?: number;

  @ApiProperty({
    description: 'Порядок отображения ингредиента',
    example: 0,
    required: false,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @ApiProperty({
    description: 'Комментарий к ингредиенту',
    example: 'без кожи',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}
