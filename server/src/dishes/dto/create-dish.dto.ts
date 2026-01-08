import { ApiProperty } from '@nestjs/swagger';
import {
  CuisineType,
  DifficultyLevel,
  DishCategory,
  MealType,
} from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { AddIngredientDto } from './add-ingredient.dto';

export class CreateDishDto {
  @ApiProperty({
    description: 'Название блюда',
    example: 'Куриный салат Цезарь',
    minLength: 2,
    maxLength: 200,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Описание блюда',
    example: 'Классический салат с курицей, сыром пармезан и соусом цезарь',
    required: false,
    maxLength: 2000,
  })
  @Transform(({ value }) => (value === '' ? null : value))
  @ValidateIf((o) => o.description !== '' && o.description !== null)
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiProperty({
    description: 'URL фотографии блюда',
    example: 'https://res.cloudinary.com/dvxl9xlts/image/upload/dish.jpg',
    required: false,
  })
  @Transform(({ value }) => (value === '' ? null : value))
  @ValidateIf((o) => o.photo !== '' && o.photo !== null)
  @IsString()
  photo?: string;

  @ApiProperty({
    description: 'Количество порций',
    example: 4,
    minimum: 1,
    maximum: 100,
    default: 1,
  })
  @IsInt()
  @Min(1)
  @Max(100)
  servings: number;

  @ApiProperty({
    description: 'Размер одной порции в граммах (опционально)',
    example: 250,
    required: false,
    minimum: 1,
    maximum: 10000,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10000)
  servingSize?: number;

  @ApiProperty({
    description: 'Время приготовления в минутах',
    example: 30,
    required: false,
    minimum: 1,
    maximum: 1440,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  cookingTimeMinutes?: number;

  @ApiProperty({
    description: 'Сложность приготовления',
    enum: DifficultyLevel,
    example: DifficultyLevel.MEDIUM,
    default: DifficultyLevel.MEDIUM,
  })
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel;

  @ApiProperty({
    description: 'Тип приема пищи',
    enum: MealType,
    example: MealType.LUNCH,
    required: false,
  })
  @IsOptional()
  @IsEnum(MealType)
  mealType?: MealType;

  @ApiProperty({
    description: 'Тип кухни',
    enum: CuisineType,
    example: CuisineType.ITALIAN,
    required: false,
  })
  @IsOptional()
  @IsEnum(CuisineType)
  cuisineType?: CuisineType;

  @ApiProperty({
    description: 'Категория блюда',
    enum: DishCategory,
    example: DishCategory.SALAD,
    required: false,
  })
  @IsOptional()
  @IsEnum(DishCategory)
  dishCategory?: DishCategory;

  @ApiProperty({
    description: 'Видимость блюда (публичное или личное)',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @ApiProperty({
    description: 'Массив ингредиентов (продукты с количеством)',
    type: [AddIngredientDto],
    example: [
      { productId: 'uuid-1', amount: 200, unit: 'G' },
      { productId: 'uuid-2', amount: 100, unit: 'G' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddIngredientDto)
  ingredients: AddIngredientDto[];

  @ApiProperty({
    description: 'Массив UUID тегов',
    example: ['uuid-тега-1', 'uuid-тега-2'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tagIds?: string[];
}
