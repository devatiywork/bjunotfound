import { ApiProperty } from '@nestjs/swagger';
import { ActivityType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class AddActivityDto {
  @ApiProperty({
    description: 'Количество шагов',
    example: 10000,
    minimum: 1,
    maximum: 100000,
  })
  @IsInt()
  @Min(1)
  @Max(100000)
  steps: number;

  @ApiProperty({
    description: 'Тип активности',
    enum: ActivityType,
    example: 'WALKING',
    required: false,
    default: 'WALKING',
  })
  @IsEnum(ActivityType)
  @IsOptional()
  activityType?: ActivityType;

  @ApiProperty({
    description: 'Дата активности в формате YYYY-MM-DD (по умолчанию сегодня)',
    example: '2026-01-03',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date?: string;
}
