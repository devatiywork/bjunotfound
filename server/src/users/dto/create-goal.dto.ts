import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class CreateGoalDto {
  @ApiProperty({
    description: 'Целевой вес в килограммах',
    example: 75,
    minimum: 20,
    maximum: 500,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(20)
  @Max(500)
  targetWeight?: number;

  @ApiProperty({
    description: 'Целевое количество калорий в сутки',
    example: 2000,
    minimum: 1000,
    maximum: 10000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(10000)
  targetCalories?: number;

  @ApiProperty({
    description: 'Дата начала цели (ISO 8601)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Дата окончания цели (ISO 8601)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Целевое количество шагов в день',
    example: 10000,
    minimum: 0,
    maximum: 100000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100000)
  targetSteps?: number;

  @ApiProperty({
    description: 'Целевое количество сожженных калорий в день',
    example: 400,
    minimum: 0,
    maximum: 10000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  targetBurnedCalories?: number;
}
