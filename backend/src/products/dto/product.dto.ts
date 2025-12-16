import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, IsUUID, Min } from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'PERFUME-001' })
  @IsString()
  sku: string;

  @ApiProperty({ example: 'Chanel No. 5' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Классический женский парфюм', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({ example: 5000 })
  @IsNumber()
  @Min(0)
  base_price: number;

  @ApiProperty({ example: 3000, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cost_price?: number;

  @ApiProperty({ example: '1234567890123', required: false })
  @IsOptional()
  @IsString()
  barcode?: string;

  @ApiProperty({ example: true, required: false, default: true })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}

export class UpdateProductDto extends PartialType(CreateProductDto) {}
