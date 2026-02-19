import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Post,
  Body,
  UseInterceptors,
  HttpCode,
} from '@nestjs/common';
import { GetOrderUseCase } from './application/get-order.usecase';
import { ListOrdersUseCase } from './application/list-orders.usecase';
import { IdempotencyInterceptor } from './infra/idempotency.interceptor';
import {
  type CreateOrderInput,
  CreateOrderUseCase,
} from './application/create-order.usecase';

@Controller('orders')
export class OrdersController {
  constructor(
    private readonly getOrderUC: GetOrderUseCase,
    private readonly listOrdersUC: ListOrdersUseCase,
    private readonly createOrderUC: CreateOrderUseCase,
  ) {}

  @Get()
  async list(@Query('limit') limit: string, @Query('cursor') cursor: string) {
    const l = limit ? parseInt(limit, 10) : 10;
    const take = Number.isFinite(l) ? Math.min(Math.max(l, 1), 100) : 20;
    return this.listOrdersUC.execute({ limit: take, cursor });
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const result = await this.getOrderUC.execute(id);
    if (!result) throw new NotFoundException('Order not found');
    return result;
  }

  @Post()
  @HttpCode(201)
  @UseInterceptors(IdempotencyInterceptor)
  async create(@Body() body: CreateOrderInput) {
    return this.createOrderUC.execute(body);
  }
}
