import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum StatsPeriod {
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class GetStatsDto {
  @ApiProperty({
    description: 'Период для статистики',
    enum: StatsPeriod,
    example: 'week',
  })
  @IsEnum(StatsPeriod)
  period: StatsPeriod;
}
