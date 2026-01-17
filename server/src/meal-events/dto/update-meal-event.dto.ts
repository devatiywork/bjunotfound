import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateMealEventDto {
  @ApiProperty({
    description: 'Дата-время события в формате ISO 8601 (UTC)',
    example: '2026-01-20T09:00:00.000Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startAt?: string;

  @ApiProperty({
    description: 'ID блюда',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsString()
  dishId?: string;

  @ApiProperty({
    description: 'Количество порций блюда (> 0)',
    example: 2,
    minimum: 0.1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0.1)
  portions?: number;

  @ApiProperty({
    description: 'ID типа приема пищи',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsString()
  mealTypeId?: string;

  @ApiProperty({
    description: 'Комментарий к событию',
    example: 'Обновленный комментарий',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'Часовой пояс события',
    example: 'Europe/Moscow',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;
}
