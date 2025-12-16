import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsEnum, IsBoolean, IsUUID, MinLength } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @ApiProperty({ example: 'admin@alaroma.local' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'Иван Иванов' })
  @IsString()
  full_name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CASHIER })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  location_id?: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}
