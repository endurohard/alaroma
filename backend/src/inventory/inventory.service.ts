import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inventory } from './inventory.entity';
import { InventoryMovement, MovementType } from './inventory-movement.entity';
import { ProductsService } from '../products/products.service';
import { LocationsService } from '../locations/locations.service';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryMovement)
    private movementsRepository: Repository<InventoryMovement>,
    private productsService: ProductsService,
    private locationsService: LocationsService,
    private dataSource: DataSource,
  ) {}

  async getByLocation(locationId: string): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      where: { location_id: locationId },
      relations: ['product', 'location'],
    });
  }

  async getByProduct(productId: string): Promise<Inventory[]> {
    return this.inventoryRepository.find({
      where: { product_id: productId },
      relations: ['product', 'location'],
    });
  }

  async getInventory(productId: string, locationId: string): Promise<Inventory> {
    let inventory = await this.inventoryRepository.findOne({
      where: { product_id: productId, location_id: locationId },
      relations: ['product', 'location'],
    });

    if (!inventory) {
      // Создаем запись если её нет
      inventory = this.inventoryRepository.create({
        product_id: productId,
        location_id: locationId,
        quantity: 0,
        reserved_quantity: 0,
      });
      await this.inventoryRepository.save(inventory);
    }

    return inventory;
  }

  async receipt(
    productId: string,
    locationId: string,
    quantity: number,
    userId: string,
    reason?: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Получаем или создаем запись остатков
      const inventory = await this.getInventory(productId, locationId);

      // Увеличиваем количество
      inventory.quantity += quantity;
      await queryRunner.manager.save(inventory);

      // Создаем движение
      const movementNumber = `RCP-${Date.now()}`;
      const movement = this.movementsRepository.create({
        movement_number: movementNumber,
        type: MovementType.RECEIPT,
        product_id: productId,
        to_location_id: locationId,
        quantity,
        reason,
        performed_by: userId,
      });
      await queryRunner.manager.save(movement);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async transfer(
    productId: string,
    fromLocationId: string,
    toLocationId: string,
    quantity: number,
    userId: string,
    reason?: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Проверяем остатки на складе отправителя
      const fromInventory = await this.getInventory(productId, fromLocationId);
      const availableQuantity = fromInventory.quantity - fromInventory.reserved_quantity;

      if (availableQuantity < quantity) {
        throw new BadRequestException(
          `Недостаточно товара на складе. Доступно: ${availableQuantity}, запрошено: ${quantity}`,
        );
      }

      // Уменьшаем количество на складе отправителя
      fromInventory.quantity -= quantity;
      await queryRunner.manager.save(fromInventory);

      // Увеличиваем количество на складе получателя
      const toInventory = await this.getInventory(productId, toLocationId);
      toInventory.quantity += quantity;
      await queryRunner.manager.save(toInventory);

      // Создаем движение
      const movementNumber = `TRF-${Date.now()}`;
      const movement = this.movementsRepository.create({
        movement_number: movementNumber,
        type: MovementType.TRANSFER,
        product_id: productId,
        from_location_id: fromLocationId,
        to_location_id: toLocationId,
        quantity,
        reason,
        performed_by: userId,
      });
      await queryRunner.manager.save(movement);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async writeOff(
    productId: string,
    locationId: string,
    quantity: number,
    userId: string,
    reason: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await this.getInventory(productId, locationId);
      const availableQuantity = inventory.quantity - inventory.reserved_quantity;

      if (availableQuantity < quantity) {
        throw new BadRequestException(`Недостаточно товара для списания`);
      }

      inventory.quantity -= quantity;
      await queryRunner.manager.save(inventory);

      const movementNumber = `WOF-${Date.now()}`;
      const movement = this.movementsRepository.create({
        movement_number: movementNumber,
        type: MovementType.WRITE_OFF,
        product_id: productId,
        from_location_id: locationId,
        quantity,
        reason,
        performed_by: userId,
      });
      await queryRunner.manager.save(movement);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  // Резервирование товара для продажи
  async reserve(productId: string, locationId: string, quantity: number): Promise<void> {
    const inventory = await this.getInventory(productId, locationId);
    const availableQuantity = inventory.quantity - inventory.reserved_quantity;

    if (availableQuantity < quantity) {
      throw new BadRequestException(`Недостаточно товара на складе`);
    }

    inventory.reserved_quantity += quantity;
    await this.inventoryRepository.save(inventory);
  }

  // Снятие резерва
  async unreserve(productId: string, locationId: string, quantity: number): Promise<void> {
    const inventory = await this.getInventory(productId, locationId);
    inventory.reserved_quantity -= quantity;
    await this.inventoryRepository.save(inventory);
  }

  // Списание при продаже
  async sell(
    productId: string,
    locationId: string,
    quantity: number,
    userId: string,
    saleId: string,
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const inventory = await this.getInventory(productId, locationId);

      // Снимаем резерв и уменьшаем количество
      inventory.reserved_quantity -= quantity;
      inventory.quantity -= quantity;
      await queryRunner.manager.save(inventory);

      // Создаем движение
      const movementNumber = `SALE-${Date.now()}`;
      const movement = this.movementsRepository.create({
        movement_number: movementNumber,
        type: MovementType.SALE,
        product_id: productId,
        from_location_id: locationId,
        quantity,
        performed_by: userId,
        sale_id: saleId,
      });
      await queryRunner.manager.save(movement);

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
