import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from '../products/product.entity';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sale_id: string;

  @ManyToOne(() => Sale, (sale) => sale.items)
  @JoinColumn({ name: 'sale_id' })
  sale: Sale;

  @Column({ type: 'uuid' })
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_price: number;

  @Column({ default: false })
  is_gift: boolean;

  @CreateDateColumn()
  created_at: Date;
}
