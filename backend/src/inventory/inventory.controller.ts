import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { TransferDto, WriteOffDto, ReceiptDto } from './dto/inventory.dto';

@ApiTags('inventory')
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Получить остатки по локации' })
  getByLocation(@Query('locationId') locationId: string) {
    return this.inventoryService.getByLocation(locationId);
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Получить остатки товара по всем локациям' })
  getByProduct(@Param('productId') productId: string) {
    return this.inventoryService.getByProduct(productId);
  }

  @Post('receipt')
  @ApiOperation({ summary: 'Приход товара' })
  receipt(@Body() receiptDto: ReceiptDto) {
    return this.inventoryService.receipt(
      receiptDto.product_id,
      receiptDto.location_id,
      receiptDto.quantity,
      receiptDto.user_id,
      receiptDto.reason,
    );
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Перемещение товара' })
  transfer(@Body() transferDto: TransferDto) {
    return this.inventoryService.transfer(
      transferDto.product_id,
      transferDto.from_location_id,
      transferDto.to_location_id,
      transferDto.quantity,
      transferDto.user_id,
      transferDto.reason,
    );
  }

  @Post('writeoff')
  @ApiOperation({ summary: 'Списание товара' })
  writeOff(@Body() writeOffDto: WriteOffDto) {
    return this.inventoryService.writeOff(
      writeOffDto.product_id,
      writeOffDto.location_id,
      writeOffDto.quantity,
      writeOffDto.user_id,
      writeOffDto.reason,
    );
  }
}
