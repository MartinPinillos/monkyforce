import { ApiProperty } from '@nestjs/swagger';
import type { AuthenticatedUser } from '../../users/domain/authenticated-user.js';

export class AuthUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'usuario' })
  loginName: string;

  @ApiProperty({ type: [String], example: ['ROLE_CODE'] })
  roles: string[];

  @ApiProperty({ type: [String], example: ['PERMISSION_CODE'] })
  permissions: string[];

  static from(user: AuthenticatedUser): AuthUserDto {
    return {
      id: user.id,
      loginName: user.loginName,
      roles: user.roles,
      permissions: user.permissions,
    };
  }
}

export class AuthResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user: AuthUserDto;
}
