import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class RejectBrandDto {
  @ApiProperty({
    description: 'Причина отклонения бренда',
    example:
      'Дубликат существующего бренда "Danone". Используйте бренд с ID: uuid-123',
    minLength: 10,
    maxLength: 500,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(500)
  reason: string;
}
