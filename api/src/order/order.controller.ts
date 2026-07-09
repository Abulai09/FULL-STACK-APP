import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { JwtAuthGuard } from 'src/guards/jwtAuthGuards';
import { RolesGuard } from 'src/guards/rolesGuard';
import { Role } from 'src/guards/roles.decarator';
import { Request } from 'express';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto/create-order.dto';

@Controller('order')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  // POST /order — создать заказ из корзины
  @Post()
  async createFromCart(@Req() req: Request, @Body() dto: CreateOrderDto) {
    const user = req.user as any;
    return await this.orderService.createFromCart(user.id, dto);
  }

  // GET /order/my — мои заказы
  @Get('my')
  async getMyOrders(@Req() req: Request) {
    const user = req.user as any;
    return await this.orderService.getMyOrders(user.id);
  }

  // GET /order/all — все заказы (только admin)
  @Get('all')
  @UseGuards(RolesGuard)
  @Role('admin')
  async getAllOrders() {
    return await this.orderService.getAllOrders();
  }

  // GET /order/:id
  @Get(':id')
  async getOne(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as any;
    return await this.orderService.getOne(id, user);
  }

  // PATCH /order/:id/status — обновить статус (только admin)
  @Patch(':id/status')
  @UseGuards(RolesGuard)
  @Role('admin')
  async updateStatus(
    @Param('id') id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return await this.orderService.updateStatus(id, dto);
  }

  // PATCH /order/:id/cancel — отменить заказ
  @Patch(':id/cancel')
  async cancelOrder(@Param('id') id: number, @Req() req: Request) {
    const user = req.user as any;
    return await this.orderService.cancelOrder(id, user);
  }
}
