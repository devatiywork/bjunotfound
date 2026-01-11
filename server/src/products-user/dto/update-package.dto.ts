import { ApiProperty } from '@nestjs/swagger';
import { Currency } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdatePackageDto {
  @ApiProperty({
    description: 'Общий вес упаковки в граммах',
    example: 1000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalWeightG?: number;

  @ApiProperty({
    description: 'Общий объём упаковки в миллилитрах',
    example: 1000,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalVolumeMl?: number;

  @ApiProperty({
    description: 'Цена за упаковку',
    example: 89.9,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  priceTotal?: number;

  @ApiProperty({
    description: 'Валюта',
    example: Currency.RUB,
    enum: Currency,
    required: false,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency;

  @ApiProperty({
    description: 'Дата покупки (ISO 8601)',
    example: '2024-01-11T10:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  purchasedAt?: string;

  @ApiProperty({
    description: 'Название магазина',
    example: 'Пятёрочка',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  store?: string;

  @ApiProperty({
    description: 'Заметка (акция, комментарий)',
    example: 'Акция 1+1',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}
