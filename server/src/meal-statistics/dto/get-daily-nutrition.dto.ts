import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDate, IsOptional } from 'class-validator';

export class GetDailyNutritionDto {
  @ApiProperty({
    description: 'Дата для получения статистики (по умолчанию - сегодня)',
    example: '2025-01-15',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  date?: Date;
}
