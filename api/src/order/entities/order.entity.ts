import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending', // ожидает
  CONFIRMED = 'confirmed', // подтверждён
  SHIPPING = 'shipping', // в доставке
  DELIVERED = 'delivered', // доставлен
  CANCELLED = 'cancelled', // отменён
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: number;

  @OneToMany(() => OrderItem, (item) => item.order, {
    eager: true,
    cascade: true,
  })
  items!: OrderItem[];

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status!: OrderStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalPrice!: number;

  @Column({ nullable: true })
  address!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
