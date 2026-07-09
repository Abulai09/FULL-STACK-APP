import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CartService } from 'src/cart/cart.service';
import { ProductService } from 'src/product/product.service';
import { Product } from 'src/product/entities/product.entity';
import { User, UserRole } from 'src/user/entities/user.entity';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    private cartService: CartService,
    private productService: ProductService,
  ) {}

  // ✅ Создать заказ из корзины
  async createFromCart(userId: number, dto: CreateOrderDto): Promise<Order> {
    const cartData = await this.cartService.getCartTotal(userId);

    if (cartData.items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    // Проверяем stock каждого товара перед заказом
    for (const item of cartData.items) {
      const product = (await this.productService.findOne(
        item.productId,
      )) as unknown as Product;

      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Not enough stock for "${item.title}". Available: ${product.stock}`,
        );
      }
    }

    // Создаём заказ
    const order = this.orderRepo.create({
      userId,
      totalPrice: cartData.total,
      address: dto.address,
      status: OrderStatus.PENDING,
    });

    const savedOrder = await this.orderRepo.save(order);

    // Создаём OrderItems
    const orderItems = cartData.items.map((item) =>
      this.orderItemRepo.create({
        orderId: savedOrder.id,
        productId: item.productId,
        title: item.title, // snapshot
        price: item.price, // snapshot
        quantity: item.quantity,
      }),
    );

    await this.orderItemRepo.save(orderItems);

    // Уменьшаем stock продуктов
    for (const item of cartData.items) {
      const product = (await this.productService.findOne(
        item.productId,
      )) as unknown as Product;

      await this.productService.update(
        item.productId,
        { stock: product.stock - item.quantity },
        { id: userId, role: UserRole.ADMIN } as User, // admin bypass
      );
    }

    // Очищаем корзину
    await this.cartService.clearCart(userId);

    return (await this.orderRepo.findOne({
      where: { id: savedOrder.id },
    })) as Order;
  }

  // ✅ Мои заказы
  async getMyOrders(userId: number): Promise<Order[]> {
    return await this.orderRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  // ✅ Один заказ
  async getOne(id: number, user: User): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    // Обычный user видит только свои заказы
    if (order.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  // ✅ Обновить статус — только admin
  async updateStatus(id: number, dto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    order.status = dto.status;
    return await this.orderRepo.save(order);
  }

  // ✅ Отменить заказ — только owner или admin
  async cancelOrder(id: number, user: User): Promise<Order> {
    const order = await this.orderRepo.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    if (order.userId !== user.id && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access denied');
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new BadRequestException('Cannot cancel delivered order');
    }

    // Возвращаем stock продуктов
    for (const item of order.items) {
      const product = (await this.productService.findOne(
        item.productId,
      )) as unknown as Product;

      if (product) {
        await this.productService.update(
          item.productId,
          { stock: product.stock + item.quantity },
          { id: user.id, role: UserRole.ADMIN } as User,
        );
      }
    }

    order.status = OrderStatus.CANCELLED;
    return await this.orderRepo.save(order);
  }

  // ✅ Все заказы — только admin
  async getAllOrders(): Promise<Order[]> {
    return await this.orderRepo.find({
      order: { createdAt: 'DESC' },
    });
  }
}
