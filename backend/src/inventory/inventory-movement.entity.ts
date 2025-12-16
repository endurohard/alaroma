import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { Location } from '../locations/location.entity';
import { User } from '../users/user.entity';

export enum MovementType {
  RECEIPT = 'receipt',
  TRANSFER = 'transfer',
  SALE = 'sale',
  WRITE_OFF = 'write_off',
  ADJUSTMENT = 'adjustment',
}

@Entity('inventory_movements')
export class InventoryMovement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  movement_number: string;

  @Column({
    type: 'enum',
    enum: MovementType,
  })
  type: MovementType;

  @Column({ type: 'uuid' })
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid', nullable: true })
  from_location_id: string;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'from_location_id' })
  from_location: Location;

  @Column({ type: 'uuid', nullable: true })
  to_location_id: string;

  @ManyToOne(() => Location, { nullable: true })
  @JoinColumn({ name: 'to_location_id' })
  to_location: Location;

  @Column({ type: 'integer' })
  quantity: number;

  @Column({ nullable: true })
  reason: string;

  @Column({ type: 'uuid' })
  performed_by: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'performed_by' })
  performer: User;

  @Column({ type: 'uuid', nullable: true })
  sale_id: string;

  @CreateDateColumn()
  created_at: Date;
}
