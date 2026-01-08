import { FormulaType } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class CalculateGoalPaceDto {
  @IsNumber()
  @Min(20)
  @Max(500)
  targetWeight: number;

  @IsOptional()
  @IsEnum(FormulaType)
  formula?: FormulaType;

  @IsOptional()
  @IsDateString()
  startDate?: string;
}
