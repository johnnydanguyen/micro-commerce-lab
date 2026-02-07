import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Inject,
  Query,
} from '@nestjs/common';
import { ORDER_REPOSITORY } from './infra/tokens';
import type { OrderRepository } from './infra/order.repository';
import { GetOrderUseCase } from './application/get-order.usecase';
import { ListOrdersUseCase } from './application/list-orders.usecase';

@Controller('orders')
export class OrdersController {
  private readonly getOrder: GetOrderUseCase;
  private readonly listOrders: ListOrdersUseCase;

  constructor(@Inject(ORDER_REPOSITORY) repo: OrderRepository) {
    this.getOrder = new GetOrderUseCase(repo);
    this.listOrders = new ListOrdersUseCase(repo);
  }

  @Get()
  async list(@Query('limit') limit: string, @Query('cursor') cursor: string) {
    const l = limit ? parseInt(limit, 10) : 10;
    const take = Number.isFinite(l) ? Math.min(Math.max(l, 1), 100) : 20;
    return this.listOrders.execute({ limit: take, cursor });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.getOrder.execute(id);
    if (!result) throw new NotFoundException('Order not found');
    return result;
  }
}
