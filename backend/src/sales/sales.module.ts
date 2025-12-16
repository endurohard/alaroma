import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Sale, SaleItem]),
    forwardRef(() => InventoryModule),
    AuthModule,
  ],
  controllers: [SalesController],
  providers: [SalesService],
  exports: [SalesService],
})
export class SalesModule {}
