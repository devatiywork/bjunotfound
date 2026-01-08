import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';

export class UpdateGoalDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsInt()
  @Min(800)
  targetCalories?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100000)
  targetSteps?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10000)
  targetBurnedCalories?: number;
}
