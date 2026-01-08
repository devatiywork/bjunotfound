import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class AddWeightDto {
  @ApiProperty({
    description: 'Вес в килограммах',
    example: 75.5,
    minimum: 20,
    maximum: 500,
  })
  @IsNumber()
  @Min(20)
  @Max(500)
  weight: number;

  @ApiProperty({
    description:
      'Дата измерения веса (ISO 8601). Если не указана - используется текущая дата',
    example: '2025-12-21',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  date?: string;
}
