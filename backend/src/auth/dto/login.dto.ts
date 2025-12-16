import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@alaroma.local',
    description: 'Email пользователя',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'admin123',
    description: 'Пароль пользователя',
    minLength: 6,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}

export class LoginResponseDto {
  @ApiProperty({ description: 'JWT access token' })
  access_token: string;

  @ApiProperty({ description: 'JWT refresh token' })
  refresh_token: string;

  @ApiProperty({ description: 'Данные пользователя' })
  user: {
    id: string;
    email: string;
    full_name: string;
    role: string;
    location_id: string | null;
  };
}
