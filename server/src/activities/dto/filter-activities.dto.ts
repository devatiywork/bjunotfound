import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, Max, Min } from 'class-validator';

export class FilterActivitiesDto {
  @ApiProperty({
    description: 'Начальная дата периода (YYYY-MM-DD)',
    example: '2026-01-01',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    description: 'Конечная дата периода (YYYY-MM-DD)',
    example: '2026-01-31',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    description: 'Номер страницы',
    example: 1,
    minimum: 1,
    required: false,
    default: 1,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiProperty({
    description: 'Количество записей на странице',
    example: 30,
    minimum: 1,
    maximum: 365,
    required: false,
    default: 30,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  @IsOptional()
  limit?: number = 30;
}
