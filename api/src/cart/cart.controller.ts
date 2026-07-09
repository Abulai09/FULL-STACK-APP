import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { JwtAuthGuard } from 'src/guards/jwtAuthGuards';
import { Request } from 'express';
import { AddToCartDto, UpdateCartDto } from './dto/create-cart.dto';

@Controller('cart')
@UseGuards(JwtAuthGuard) // ✅ все роуты только для авторизованных
export class CartController {
  constructor(private readonly cartService: CartService) {}

  // GET /cart
  @Get()
  async getCart(@Req() req: Request) {
    const user = req.user as any;
    return await this.cartService.getCartTotal(user.id);
  }

  // POST /cart
  @Post()
  async addItem(@Req() req: Request, @Body() dto: AddToCartDto) {
    const user = req.user as any;
    return await this.cartService.addItem(user.id, dto);
  }

  // PATCH /cart
  @Patch()
  async updateItem(@Req() req: Request, @Body() dto: UpdateCartDto) {
    const user = req.user as any;
    return await this.cartService.updateItem(user.id, dto);
  }

  // DELETE /cart/:productId
  @Delete(':productId')
  async removeItem(@Req() req: Request, @Param('productId') productId: number) {
    const user = req.user as any;
    return await this.cartService.removeItem(user.id, productId);
  }

  // DELETE /cart
  @Delete()
  async clearCart(@Req() req: Request) {
    const user = req.user as any;
    return await this.cartService.clearCart(user.id);
  }
}
