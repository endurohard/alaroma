import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Product } from '../products/product.entity';
import { Location } from '../locations/location.entity';

@Entity('inventory')
@Unique(['product_id', 'location_id'])
export class Inventory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  product_id: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'uuid' })
  location_id: string;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ type: 'integer', default: 0 })
  quantity: number;

  @Column({ type: 'integer', default: 0 })
  reserved_quantity: number;

  @UpdateDateColumn()
  updated_at: Date;
}
