import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

class NutritionUpdateDto {
  @ApiProperty({
    description: 'Калории на 100г',
    example: 59,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  caloriesKcal?: number;

  @ApiProperty({
    description: 'Белки на 100г (граммы)',
    example: 2.9,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  proteinsG?: number;

  @ApiProperty({
    description: 'Жиры на 100г (граммы)',
    example: 3.2,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fatsG?: number;

  @ApiProperty({
    description: 'Углеводы на 100г (граммы)',
    example: 4.7,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  carbohydratesG?: number;

  @ApiProperty({
    description: 'Сахара на 100г (граммы)',
    example: 4.7,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sugarsG?: number;

  @ApiProperty({
    description: 'Клетчатка на 100г (граммы)',
    example: 0.5,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fiberG?: number;

  @ApiProperty({
    description: 'Соль на 100г (граммы)',
    example: 0.1,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  saltG?: number;
}

export class UpdateProductUserDto {
  @ApiProperty({
    description: 'Название продукта',
    example: 'Молоко 3.2%',
    required: false,
    minLength: 2,
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @ApiProperty({
    description: 'Язык названия',
    example: Language.RU,
    enum: Language,
    required: false,
  })
  @IsOptional()
  @IsEnum(Language)
  lang?: Language;

  @ApiProperty({
    description: 'Штрихкод продукта (EAN/UPC, 8-13 цифр)',
    example: '4607039290530',
    required: false,
    minLength: 8,
    maxLength: 13,
  })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(13)
  @Matches(/^\d+$/, { message: 'Штрихкод должен содержать только цифры' })
  barcode?: string;

  @ApiProperty({
    description: 'ID категории (null для удаления связи)',
    example: 'uuid',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  categoryId?: string | null;

  @ApiProperty({
    description: 'ID бренда (null для удаления связи)',
    example: 'uuid',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  brandId?: string | null;

  @ApiProperty({
    description: 'ID глобального продукта (null для удаления связи)',
    example: 'uuid',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  productGlobalId?: string | null;

  @ApiProperty({
    description: 'Пищевая ценность на 100г',
    type: NutritionUpdateDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => NutritionUpdateDto)
  nutrition?: NutritionUpdateDto;
}
