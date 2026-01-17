import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateMealTypeDto {
  @ApiProperty({
    description: 'Название типа приема пищи',
    example: 'Второй завтрак',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Порядок отображения (необязательно, по умолчанию 0)',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  sortOrder?: number;
}
