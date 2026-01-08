import { IsString } from 'class-validator';

export class UpdateUserRoleDto {
  @IsString()
  roleId: string; // 'user' или 'admin'
}
