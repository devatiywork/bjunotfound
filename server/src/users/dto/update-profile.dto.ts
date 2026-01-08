import { ApiProperty } from '@nestjs/swagger';
import { FormulaType, Gender } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({
    description: 'Пол пользователя',
    enum: Gender,
    example: 'MALE',
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    description: 'Дата рождения (ISO 8601)',
    example: '1990-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @ApiProperty({
    description: 'Рост в сантиметрах',
    example: 180,
    minimum: 50,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(50)
  height?: number;

  @ApiProperty({
    description: 'Формула расчета базального метаболизма',
    enum: FormulaType,
    example: 'MIFFLIN_ST_JEOR',
    required: false,
  })
  @IsOptional()
  @IsEnum(FormulaType)
  formulaType?: FormulaType;

  @ApiProperty({
    description: 'ID уровня физической активности',
    example: 'moderate',
    required: false,
  })
  @IsOptional()
  @IsString()
  activityLevelId?: string;

  @ApiProperty({
    description: 'Часовой пояс пользователя (IANA)',
    example: 'Europe/Moscow',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;
}
