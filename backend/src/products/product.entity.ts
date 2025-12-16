import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Category } from '../categories/category.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sku: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  category_id: string;

  @ManyToOne(() => Category, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  base_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost_price: number;

  @Column({ nullable: true })
  barcode: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
