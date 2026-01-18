import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsArray, IsString, IsUUID } from 'class-validator';

export class MergeBrandsDto {
  @ApiProperty({
    description: 'ID бренда, который будет одобрен (целевой)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsUUID()
  targetBrandId: string;

  @ApiProperty({
    description:
      'Массив ID брендов для объединения (должен включать targetBrandId)',
    example: [
      '550e8400-e29b-41d4-a716-446655440000',
      '550e8400-e29b-41d4-a716-446655440001',
      '550e8400-e29b-41d4-a716-446655440002',
    ],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(2, { message: 'Минимум 2 бренда для объединения' })
  @IsUUID('4', { each: true })
  brandIdsToMerge: string[];
}
