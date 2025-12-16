import { Injectable, NotFoundException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale, SaleStatus } from './sale.entity';
import { SaleItem } from './sale-item.entity';
import { CreateSaleDto } from './dto/sale.dto';
import { InventoryService } from '../inventory/inventory.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private saleItemsRepository: Repository<SaleItem>,
    @Inject(forwardRef(() => InventoryService))
    private inventoryService: InventoryService,
    private dataSource: DataSource,
  ) {}

  async create(createSaleDto: CreateSaleDto, cashierId: string): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate sale number
      const saleNumber = await this.generateSaleNumber();

      // Calculate totals
      let subtotal = 0;
      let discountAmount = 0;

      const items = createSaleDto.items.map(item => {
        const itemSubtotal = item.unitPrice * item.quantity;
        const itemDiscount = item.discountAmount || 0;
        subtotal += itemSubtotal;
        discountAmount += itemDiscount;

        return {
          product_id: item.productId,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          discount_amount: itemDiscount,
          total_price: itemSubtotal - itemDiscount,
          is_gift: item.isGift || false,
        };
      });

      const totalAmount = subtotal - discountAmount;

      // Create sale
      const sale = this.salesRepository.create({
        sale_number: saleNumber,
        location_id: createSaleDto.locationId,
        cashier_id: cashierId,
        customer_phone: createSaleDto.customerPhone,
        customer_name: createSaleDto.customerName,
        subtotal,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        payment_method: createSaleDto.paymentMethod,
        promotion_id: createSaleDto.promotionId,
        certificate_id: createSaleDto.certificateId,
        notes: createSaleDto.notes,
        status: SaleStatus.PENDING,
      });

      const savedSale = await queryRunner.manager.save(sale);

      // Create sale items
      const saleItems = items.map(item =>
        this.saleItemsRepository.create({
          sale_id: savedSale.id,
          ...item,
        })
      );

      await queryRunner.manager.save(saleItems);

      // Reserve inventory for each item
      for (const item of createSaleDto.items) {
        await this.inventoryService.reserve(
          item.productId,
          createSaleDto.locationId,
          item.quantity,
        );
      }

      // Complete the sale immediately (deduct from inventory)
      await this.completeSale(savedSale.id, cashierId, queryRunner);

      await queryRunner.commitTransaction();

      return this.findOne(savedSale.id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async completeSale(saleId: string, userId: string, queryRunner?: any): Promise<Sale> {
    const sale = await this.findOne(saleId);

    if (sale.status !== SaleStatus.PENDING) {
      throw new BadRequestException('Продажа уже завершена или отменена');
    }

    // Load items
    const items = await this.saleItemsRepository.find({
      where: { sale_id: saleId },
    });

    // Process each item through inventory
    for (const item of items) {
      await this.inventoryService.sell(
        item.product_id,
        sale.location_id,
        item.quantity,
        userId,
        saleId,
      );
    }

    // Update sale status
    sale.status = SaleStatus.COMPLETED;

    if (queryRunner) {
      await queryRunner.manager.save(sale);
    } else {
      await this.salesRepository.save(sale);
    }

    return this.findOne(saleId);
  }

  async cancel(id: string): Promise<Sale> {
    const sale = await this.findOne(id);

    if (sale.status === SaleStatus.COMPLETED) {
      throw new BadRequestException('Завершенные продажи нельзя отменить. Используйте возврат.');
    }

    if (sale.status === SaleStatus.CANCELLED) {
      throw new BadRequestException('Продажа уже отменена');
    }

    // Load items to unreserve inventory
    const items = await this.saleItemsRepository.find({
      where: { sale_id: id },
    });

    // Unreserve inventory
    for (const item of items) {
      await this.inventoryService.unreserve(
        item.product_id,
        sale.location_id,
        item.quantity,
      );
    }

    sale.status = SaleStatus.CANCELLED;
    return this.salesRepository.save(sale);
  }

  async findAll(params?: {
    locationId?: string;
    cashierId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: Sale[]; total: number }> {
    const query = this.salesRepository.createQueryBuilder('sale')
      .leftJoinAndSelect('sale.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('sale.location', 'location')
      .leftJoinAndSelect('sale.cashier', 'cashier');

    if (params?.locationId) {
      query.andWhere('sale.location_id = :locationId', { locationId: params.locationId });
    }

    if (params?.cashierId) {
      query.andWhere('sale.cashier_id = :cashierId', { cashierId: params.cashierId });
    }

    if (params?.startDate) {
      query.andWhere('sale.created_at >= :startDate', { startDate: params.startDate });
    }

    if (params?.endDate) {
      query.andWhere('sale.created_at <= :endDate', { endDate: params.endDate });
    }

    query.orderBy('sale.created_at', 'DESC');

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string): Promise<Sale> {
    const sale = await this.salesRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'location', 'cashier'],
    });

    if (!sale) {
      throw new NotFoundException(`Продажа с ID ${id} не найдена`);
    }

    return sale;
  }

  private async generateSaleNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    const prefix = `SALE-${year}${month}${day}`;

    const lastSale = await this.salesRepository
      .createQueryBuilder('sale')
      .where('sale.sale_number LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('sale.sale_number', 'DESC')
      .getOne();

    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.sale_number.split('-').pop() || '0');
      sequence = lastSequence + 1;
    }

    return `${prefix}-${String(sequence).padStart(4, '0')}`;
  }
}
