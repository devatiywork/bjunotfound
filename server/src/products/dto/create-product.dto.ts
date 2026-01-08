import { ApiProperty } from '@nestjs/swagger';
import { UnitType } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Название продукта',
    example: 'Куриная грудка',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Описание продукта',
    example: 'Филе куриной грудки без кожи',
    required: false,
    maxLength: 1000,
  })
  @Transform(({ value }) => (value === '' ? null : value))
  @ValidateIf((o) => o.description !== '' && o.description !== null)
  @IsString()
  @MaxLength(1000)
  description?: string;

  // КБЖУ на 100г
  @ApiProperty({
    description: 'Калории на 100г',
    example: 165,
    minimum: 0,
    maximum: 1000,
  })
  @IsNumber()
  @Min(0)
  @Max(1000)
  calories: number;

  @ApiProperty({
    description: 'Белки на 100г (в граммах)',
    example: 31,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  proteins: number;

  @ApiProperty({
    description: 'Жиры на 100г (в граммах)',
    example: 3.6,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  fats: number;

  @ApiProperty({
    description: 'Углеводы на 100г (в граммах)',
    example: 0,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  carbs: number;

  // Дополнительные макросы
  @ApiProperty({
    description: 'Клетчатка на 100г (в граммах)',
    example: 2.5,
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  fiber?: number;

  @ApiProperty({
    description: 'Сахар на 100г (в граммах)',
    example: 5.2,
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  sugar?: number;

  @ApiProperty({
    description: 'Насыщенные жиры на 100г (в граммах)',
    example: 1.2,
    required: false,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  saturatedFat?: number;

  @ApiProperty({
    description: 'Натрий на 100г (в мг)',
    example: 50,
    required: false,
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  sodium?: number;

  // Порция и единицы
  @ApiProperty({
    description: 'Размер стандартной порции (в граммах или мл)',
    example: 100,
    required: false,
    minimum: 0,
    maximum: 10000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  servingSize?: number;

  @ApiProperty({
    description: 'Единица измерения',
    enum: UnitType,
    example: UnitType.G,
    default: UnitType.G,
  })
  @IsEnum(UnitType)
  unit: UnitType;

  // Метаданные
  @ApiProperty({
    description: 'Бренд или производитель',
    example: 'Простоквашино',
    required: false,
    maxLength: 200,
  })
  @Transform(({ value }) => (value === '' ? null : value))
  @ValidateIf((o) => o.brand !== '' && o.brand !== null)
  @IsString()
  @MaxLength(200)
  brand?: string;

  @ApiProperty({
    description: 'Штрих-код продукта (EAN-13/UPC)',
    example: '4607065597597',
    required: false,
    pattern: '^[0-9]{8,14}$',
  })
  @Transform(({ value }) => (value === '' ? null : value))
  @ValidateIf(
    (o) => o.barcode !== '' && o.barcode !== null && o.barcode !== undefined,
  )
  @IsString()
  @MinLength(8, {
    message: 'Штрих-код должен содержать от 8 до 14 цифр',
  })
  @Matches(/^[0-9]{8,14}$/, {
    message: 'Штрих-код должен содержать от 8 до 14 цифр',
  })
  barcode?: string;

  @ApiProperty({
    description: 'URL фотографии продукта',
    example: 'https://example.com/photo.jpg',
    required: false,
  })
  @Transform(({ value }) => (value === '' ? null : value))
  @ValidateIf((o) => o.photo !== '' && o.photo !== null)
  @IsString()
  photo?: string;

  @ApiProperty({
    description: 'Цена продукта (в рублях)',
    example: 299.99,
    required: false,
    minimum: 0,
    maximum: 1000000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000000)
  price?: number;

  @ApiProperty({
    description: 'Видимость продукта (публичный или личный)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  // Связи
  @ApiProperty({
    description: 'ID категории продукта',
    example: 'uuid',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'Массив ID тегов',
    example: ['uuid1', 'uuid2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  tagIds?: string[];
}
