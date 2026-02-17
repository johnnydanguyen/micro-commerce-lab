import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Inject,
  Query,
  Post,
  Body,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { ORDER_REPOSITORY } from './infra/tokens';
import type { OrderRepository } from './infra/order.repository';
import { GetOrderUseCase } from './application/get-order.usecase';
import { ListOrdersUseCase } from './application/list-orders.usecase';
import { IdempotencyInterceptor } from './infra/idempotency.interceptor';
import {
  type CreateOrderInput,
  CreateOrderUseCase,
} from './application/create-order.usecase';

@Controller('orders')
export class OrdersController {
  private readonly getOrder: GetOrderUseCase;
  private readonly listOrders: ListOrdersUseCase;
  private readonly createOrder: CreateOrderUseCase;

  constructor(@Inject(ORDER_REPOSITORY) repo: OrderRepository) {
    this.getOrder = new GetOrderUseCase(repo);
    this.listOrders = new ListOrdersUseCase(repo);
    this.createOrder = new CreateOrderUseCase(repo);
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

  @Post()
  @HttpCode(201)
  @UseInterceptors(IdempotencyInterceptor)
  async create(@Body() body: CreateOrderInput) {
    return this.createOrder.execute(body);
  }
}
