import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'usuario' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  loginName: string;

  @ApiProperty({ type: String, format: 'password', writeOnly: true })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1024)
  password: string;
}
