import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested, IsBoolean, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../sale.entity';

export class CreateSaleItemDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  productId: string;

  @ApiProperty({ example: 2 })
  @IsNumber()
  quantity: number;

  @ApiProperty({ example: 1500.00 })
  @IsNumber()
  unitPrice: number;

  @ApiProperty({ example: 100.00, required: false })
  @IsOptional()
  @IsNumber()
  discountAmount?: number;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isGift?: boolean;
}

export class CreateSaleDto {
  @ApiProperty({ example: 'uuid' })
  @IsUUID()
  locationId: string;

  @ApiProperty({ type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items: CreateSaleItemDto[];

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CASH })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: '+7 (999) 123-45-67', required: false })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ example: 'Иван Иванов', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  promotionId?: string;

  @ApiProperty({ example: 'uuid', required: false })
  @IsOptional()
  @IsUUID()
  certificateId?: string;

  @ApiProperty({ example: 'Примечания к продаже', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
