import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class ReceiptDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty()
  @IsUUID()
  location_id: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class TransferDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty()
  @IsUUID()
  from_location_id: string;

  @ApiProperty()
  @IsUUID()
  to_location_id: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class WriteOffDto {
  @ApiProperty()
  @IsUUID()
  product_id: string;

  @ApiProperty()
  @IsUUID()
  location_id: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty()
  @IsUUID()
  user_id: string;

  @ApiProperty()
  @IsString()
  reason: string;
}
