import { FormulaType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class CalculateCaloriesDto {
  @IsNumber()
  @Min(20)
  @Max(500)
  weight: number;

  @IsNumber()
  @Min(20)
  @Max(500)
  targetWeight: number;

  @IsInt()
  @Min(1)
  @Max(3650)
  days: number;

  @IsOptional()
  @IsEnum(FormulaType)
  formula?: FormulaType;

  @IsOptional()
  @IsDateString()
  startDate?: string;
}
