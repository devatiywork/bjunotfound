import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateServingDto {
  @ApiProperty({
    description: 'Название порции',
    example: 'Стакан',
    required: false,
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string;

  @ApiProperty({
    description: 'Количество единиц в порции',
    example: 1,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amountUnits?: number;

  @ApiProperty({
    description: 'Вес порции в граммах',
    example: 250,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  weightG?: number;

  @ApiProperty({
    description: 'Объём порции в миллилитрах',
    example: 250,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  volumeMl?: number;

  @ApiProperty({
    description: 'Является ли порция по умолчанию',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}
