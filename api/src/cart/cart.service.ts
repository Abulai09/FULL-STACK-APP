import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { RedisService } from 'src/redis/redis.service';
import { ProductService } from 'src/product/product.service';
import { Product } from 'src/product/entities/product.entity';
import { Cart, CartItem } from './entities/cart.entity';
import { AddToCartDto, UpdateCartDto } from './dto/create-cart.dto';

const CART_TTL = 60 * 60 * 24 * 7;
const CART_KEY = (userId: number) => `cart:${userId}`;

@Injectable()
export class CartService {
  constructor(
    private redisService: RedisService,
    private productService: ProductService,
  ) {}

  async getCart(userId: number): Promise<Cart> {
    const cart = await this.redisService.get(CART_KEY(userId));
    if (!cart) {
      return { userId, items: [], updatedAt: new Date().toISOString() };
    }
    return cart as unknown as Cart; // ✅ через unknown
  }

  async addItem(userId: number, dto: AddToCartDto): Promise<Cart> {
    const product = (await this.productService.findOne(
      dto.productId,
    )) as unknown as Product; // ✅
    if (!product) throw new NotFoundException('Product not found');

    if (product.stock < dto.quantity) {
      throw new BadRequestException(
        `Only ${product.stock} items available in stock`,
      );
    }

    const cart = await this.getCart(userId);

    const existingItem = cart.items.find(
      (item) => item.productId === dto.productId,
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + dto.quantity;
      if (newQuantity > product.stock) {
        throw new BadRequestException(
          `Cannot add more than ${product.stock} items`,
        );
      }
      existingItem.quantity = newQuantity;
    } else {
      const newItem: CartItem = {
        productId: product.id,
        title: product.title,
        price: Number(product.price),
        imageUrl: product.imageUrl,
        quantity: dto.quantity,
      };
      cart.items.push(newItem);
    }

    cart.updatedAt = new Date().toISOString();
    await this.redisService.set(CART_KEY(userId), cart, CART_TTL);
    return cart;
  }

  async updateItem(userId: number, dto: UpdateCartDto): Promise<Cart> {
    const cart = await this.getCart(userId);

    if (dto.quantity === 0) {
      cart.items = cart.items.filter(
        (item) => item.productId !== dto.productId,
      );
    } else {
      const item = cart.items.find((item) => item.productId === dto.productId);
      if (!item) throw new NotFoundException('Item not found in cart');

      const product = (await this.productService.findOne(
        dto.productId,
      )) as unknown as Product; // ✅
      if (dto.quantity > product.stock) {
        throw new BadRequestException(`Only ${product.stock} items available`);
      }
      item.quantity = dto.quantity;
    }

    cart.updatedAt = new Date().toISOString();
    await this.redisService.set(CART_KEY(userId), cart, CART_TTL);
    return cart;
  }

  async removeItem(userId: number, productId: number): Promise<Cart> {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter((item) => item.productId !== productId);
    cart.updatedAt = new Date().toISOString();
    await this.redisService.set(CART_KEY(userId), cart, CART_TTL);
    return cart;
  }

  async clearCart(userId: number): Promise<{ message: string }> {
    await this.redisService.del(CART_KEY(userId));
    return { message: 'Cart cleared' };
  }

  async getCartTotal(userId: number): Promise<{
    items: CartItem[];
    total: number;
    count: number;
  }> {
    const cart = await this.getCart(userId);
    const total = cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const count = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: cart.items,
      total: Math.round(total * 100) / 100,
      count,
    };
  }
}
