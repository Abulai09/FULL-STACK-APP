import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class CreateOrderDto {
  @IsString()
  @IsOptional()
  address?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
