import { ApiProperty } from '@nestjs/swagger';
import { DishStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

/**
 * DTO для изменения статуса блюда
 */
export class UpdateDishStatusDto {
  @ApiProperty({
    description: 'Новый статус блюда',
    enum: DishStatus,
    example: DishStatus.READY,
  })
  @IsEnum(DishStatus)
  status: DishStatus;
}
