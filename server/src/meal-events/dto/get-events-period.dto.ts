import { ApiProperty } from '@nestjs/swagger';
import { MealEventStatus } from '@prisma/client';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class GetEventsPeriodDto {
  @ApiProperty({
    description: 'Начало периода (YYYY-MM-DD)',
    example: '2026-01-20',
  })
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Конец периода (YYYY-MM-DD)',
    example: '2026-01-27',
  })
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Фильтр по статусу',
    enum: MealEventStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(MealEventStatus)
  status?: MealEventStatus;

  @ApiProperty({
    description: 'Фильтр по типу приема пищи',
    example: '123e4567-e89b-12d3-a456-426614174001',
    required: false,
  })
  @IsOptional()
  @IsString()
  mealTypeId?: string;
}
