import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Парфюмерия' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Категория парфюмерных товаров', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  parent_id?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
