import { ApiProperty } from '@nestjs/swagger';
import { UnitType } from '@prisma/client';
import { IsEnum, IsNumber, IsUUID, Min } from 'class-validator';

export class AddIngredientDto {
  @ApiProperty({
    description: 'UUID продукта',
    example: 'uuid-продукта',
  })
  @IsUUID()
  productId: string;

  @ApiProperty({
    description: 'Количество продукта',
    example: 200,
    minimum: 0.1,
  })
  @IsNumber()
  @Min(0.1)
  amount: number;

  @ApiProperty({
    description: 'Единица измерения',
    enum: UnitType,
    example: UnitType.G,
    default: UnitType.G,
  })
  @IsEnum(UnitType)
  unit: UnitType;
}
