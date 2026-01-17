import { ApiProperty } from '@nestjs/swagger';
import { MealEventStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class ChangeStatusDto {
  @ApiProperty({
    description: 'Новый статус события',
    enum: ['COMPLETED', 'SKIPPED'],
    example: 'COMPLETED',
  })
  @IsNotEmpty()
  @IsEnum(MealEventStatus, {
    message: 'Статус должен быть COMPLETED или SKIPPED',
  })
  status: MealEventStatus;
}
