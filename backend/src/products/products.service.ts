import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async findAll(search?: string, categoryId?: string): Promise<{ data: Product[]; total: number }> {
    const where: any = {};

    if (search) {
      where.name = Like(`%${search}%`);
    }

    if (categoryId) {
      where.category_id = categoryId;
    }

    const [data, total] = await this.productsRepository.findAndCount({
      where,
      relations: ['category'],
      order: { created_at: 'DESC' },
    });

    return { data, total };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!product) {
      throw new NotFoundException(`Товар с ID ${id} не найден`);
    }

    return product;
  }

  async findBySku(sku: string): Promise<Product> {
    return this.productsRepository.findOne({ where: { sku } });
  }

  async findByBarcode(barcode: string): Promise<Product> {
    return this.productsRepository.findOne({ where: { barcode } });
  }

  async create(createProductDto: CreateProductDto): Promise<Product> {
    // Проверяем уникальность SKU
    const existingSku = await this.findBySku(createProductDto.sku);
    if (existingSku) {
      throw new ConflictException(`Товар с артикулом ${createProductDto.sku} уже существует`);
    }

    // Проверяем уникальность штрихкода
    if (createProductDto.barcode) {
      const existingBarcode = await this.findByBarcode(createProductDto.barcode);
      if (existingBarcode) {
        throw new ConflictException(`Товар со штрихкодом ${createProductDto.barcode} уже существует`);
      }
    }

    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.findOne(id);

    // Проверяем уникальность SKU если он меняется
    if (updateProductDto.sku) {
      const existingSku = await this.findBySku(updateProductDto.sku);
      if (existingSku && existingSku.id !== id) {
        throw new ConflictException(`Товар с артикулом ${updateProductDto.sku} уже существует`);
      }
    }

    await this.productsRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  async search(query: string): Promise<Product[]> {
    return this.productsRepository.find({
      where: [
        { name: Like(`%${query}%`) },
        { sku: Like(`%${query}%`) },
        { barcode: Like(`%${query}%`) },
      ],
      take: 20,
    });
  }
}
