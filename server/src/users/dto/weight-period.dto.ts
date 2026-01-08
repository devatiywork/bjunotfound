import { IsDateString } from 'class-validator';

export class WeightPeriodDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;
}
