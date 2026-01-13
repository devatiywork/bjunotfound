import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsString, Min, ValidateNested } from 'class-validator';

class DishItemOrder {
  @ApiProperty({
    description: 'ID ингредиента',
    example: 'uuid',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'Новый порядок отображения',
    example: 0,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  sortOrder: number;
}

/**
 * DTO для изменения порядка ингредиентов
 */
export class ReorderDishItemsDto {
  @ApiProperty({
    description: 'Массив ингредиентов с новым порядком',
    type: [DishItemOrder],
    example: [
      { id: 'uuid1', sortOrder: 0 },
      { id: 'uuid2', sortOrder: 1 },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DishItemOrder)
  items: DishItemOrder[];
}
