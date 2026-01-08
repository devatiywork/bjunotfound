import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty({ message: 'ID роли обязателен' })
  @MaxLength(50)
  id: string;

  @IsString()
  @IsNotEmpty({ message: 'Название роли обязательно' })
  @MaxLength(100)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  description?: string;
}
