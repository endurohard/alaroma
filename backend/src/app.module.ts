import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { CategoriesModule } from './categories/categories.module';
import { LocationsModule } from './locations/locations.module';
import { InventoryModule } from './inventory/inventory.module';
import { SalesModule } from './sales/sales.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'production' ? '.env.production' : '.env',
    }),

    // TypeORM Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: process.env.NODE_ENV !== 'production', // Disable in production!
      logging: process.env.NODE_ENV !== 'production',
    }),

    // Modules
    AuthModule,
    UsersModule,
    ProductsModule,
    CategoriesModule,
    LocationsModule,
    InventoryModule,
    SalesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
