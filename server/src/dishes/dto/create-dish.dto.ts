import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO для создания блюда
 */
export class CreateDishDto {
  @ApiProperty({
    description: 'Название блюда',
    example: 'Омлет с сыром',
    minLength: 1,
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Описание блюда',
    example: 'Классический омлет с сыром чеддер',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Количество порций',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1, { message: 'Количество порций должно быть больше 0' })
  portions: number;
}
