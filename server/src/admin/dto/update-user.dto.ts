import { FormulaType, Gender } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsInt()
  @Min(50)
  height?: number;

  @IsOptional()
  @IsEnum(FormulaType)
  formulaType?: FormulaType;

  @IsOptional()
  @IsString()
  activityLevelId?: string;
}
