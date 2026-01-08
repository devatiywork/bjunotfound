import { IsNumber, Min } from 'class-validator';

export class UpdateSettingDto {
  @IsNumber()
  @Min(0)
  value: number;
}
