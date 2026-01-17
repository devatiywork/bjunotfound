import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateMealEventDto {
  @ApiProperty({
    description: 'Дата-время события в формате ISO 8601 (UTC)',
    example: '2026-01-20T08:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startAt: string;

  @ApiProperty({
    description: 'ID блюда',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  dishId: string;

  @ApiProperty({
    description: 'Количество порций блюда (> 0)',
    example: 1.5,
    minimum: 0.1,
  })
  @IsNumber()
  @Min(0.1)
  portions: number;

  @ApiProperty({
    description: 'ID типа приема пищи (опционально)',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsString()
  mealTypeId?: string;

  @ApiProperty({
    description: 'Комментарий к событию',
    example: 'С огурцами',
    required: false,
  })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({
    description: 'Часовой пояс события (если отличается от пользовательского)',
    example: 'Europe/Moscow',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;
}
