import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { Inventory } from './inventory.entity';
import { InventoryMovement } from './inventory-movement.entity';
import { ProductsModule } from '../products/products.module';
import { LocationsModule } from '../locations/locations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Inventory, InventoryMovement]),
    ProductsModule,
    LocationsModule,
  ],
  controllers: [InventoryController],
  providers: [InventoryService],
  exports: [InventoryService],
})
export class InventoryModule {}
