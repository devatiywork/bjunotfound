import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * DTO для обновления блюда.
 * Все поля опциональны.
 */
export class UpdateDishDto {
  @ApiProperty({
    description: 'Название блюда',
    example: 'Омлет с помидорами',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    description: 'Описание блюда',
    example: 'Обновленное описание',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Количество порций',
    example: 3,
    minimum: 1,
    required: false,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  portions?: number;
}
