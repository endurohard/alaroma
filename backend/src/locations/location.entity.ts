import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum LocationType {
  CENTRAL_WAREHOUSE = 'central_warehouse',
  STORE = 'store',
}

@Entity('locations')
export class Location {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: LocationType,
    default: LocationType.STORE,
  })
  type: LocationType;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
