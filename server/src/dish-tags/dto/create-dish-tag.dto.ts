import { ApiProperty } from '@nestjs/swagger';
import { TagCategory } from '@prisma/client';
import { IsEnum, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateDishTagDto {
  @ApiProperty({
    description: 'Название тега',
    example: 'Вегетарианское',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @MinLength(2, { message: 'Название должно содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Название должно содержать максимум 50 символов' })
  name: string;

  @ApiProperty({
    description: 'Категория тега',
    example: 'DIETARY',
    enum: TagCategory,
  })
  @IsEnum(TagCategory, { message: 'Недопустимая категория тега' })
  category: TagCategory;
}
