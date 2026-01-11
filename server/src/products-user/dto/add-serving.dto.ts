import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class AddServingDto {
  @ApiProperty({
    description: 'Название порции',
    example: 'Стакан',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Количество единиц в порции',
    example: 1,
    required: false,
    default: 1,
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
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ValidateIf((o) => !o.weightG && !o.volumeMl)
  validate() {
    throw new Error('Необходимо указать хотя бы одно: weightG или volumeMl');
  }
}
