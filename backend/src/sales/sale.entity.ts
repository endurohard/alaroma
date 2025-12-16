import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Location } from '../locations/location.entity';
import { SaleItem } from './sale-item.entity';

export enum PaymentMethod {
  CASH = 'cash',
  CARD = 'card',
  CERTIFICATE = 'certificate',
  MIXED = 'mixed',
}

export enum SaleStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  sale_number: string;

  @Column({ type: 'uuid' })
  location_id: string;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ type: 'uuid' })
  cashier_id: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'cashier_id' })
  cashier: User;

  @Column({ nullable: true })
  customer_phone: string;

  @Column({ nullable: true })
  customer_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total_amount: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  payment_method: PaymentMethod;

  @Column({
    type: 'enum',
    enum: SaleStatus,
    default: SaleStatus.PENDING,
  })
  status: SaleStatus;

  @Column({ type: 'uuid', nullable: true })
  promotion_id: string;

  @Column({ type: 'uuid', nullable: true })
  certificate_id: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => SaleItem, (item) => item.sale, { cascade: true })
  items: SaleItem[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
