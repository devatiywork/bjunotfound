import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {
  @ApiProperty({
    description: 'Название продукта',
    example: 'Куриная грудка',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'ID категории продукта',
    example: 'uuid',
    required: false,
  })
  categoryId?: string;
}
