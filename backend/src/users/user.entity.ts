import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CASHIER = 'cashier',
  SALESPERSON = 'salesperson',
  WAREHOUSE_WORKER = 'warehouse_worker',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  full_name: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CASHIER,
  })
  role: UserRole;

  @Column({ type: 'uuid', nullable: true })
  location_id: string;

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
