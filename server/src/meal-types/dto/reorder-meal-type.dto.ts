import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class ReorderMealTypeDto {
  @ApiProperty({
    description: 'Новый порядок отображения',
    example: 3,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  sortOrder: number;
}
