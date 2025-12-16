import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { LocationType } from '../location.entity';

export class CreateLocationDto {
  @ApiProperty({ example: 'Магазин на Арбате' })
  @IsString()
  name: string;

  @ApiProperty({ enum: LocationType, example: LocationType.STORE })
  @IsEnum(LocationType)
  type: LocationType;

  @ApiProperty({ example: 'г. Москва, ул. Арбат, д. 10', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: '+7 (495) 123-45-67', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateLocationDto extends PartialType(CreateLocationDto) {}
