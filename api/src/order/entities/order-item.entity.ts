import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from 'src/product/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'orderId' })
  order!: Order;

  @Column()
  orderId!: number;

  @ManyToOne(() => Product, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'productId' })
  product!: Product;

  @Column({ nullable: true })
  productId!: number;

  // ✅ Сохраняем snapshot цены и названия
  // (продукт может измениться или удалиться)
  @Column()
  title!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price!: number;

  @Column()
  quantity!: number;
}
