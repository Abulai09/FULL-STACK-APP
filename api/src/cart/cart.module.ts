import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [ProductModule], // ✅ нужен ProductService
  controllers: [CartController],
  providers: [CartService],
  exports: [CartService], // ✅ нужен будет в Order
})
export class CartModule {}
