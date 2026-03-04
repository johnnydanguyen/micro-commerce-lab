import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ORDER_REPOSITORY } from './infra/tokens';
import { OrdersController } from './orders.controller';
import { ConfigModule } from '@nestjs/config';
import { IdempotencyInterceptor } from './infra/idempotency.interceptor';
import { IdempotencyService } from './infra/idempotency.service';
import { QueuesModule } from './queues/queues.module';
import { GetOrderUseCase } from './application/get-order.usecase';
import { OrderRepository } from './infra/order.repository';
import { ListOrdersUseCase } from './application/list-orders.usecase';
import { CreateOrderUseCase } from './application/create-order.usecase';
import { MarkOrderPaidUseCase } from './application/mark-order-paid.usecase';
import { HttpModule } from '@nestjs/axios';
import { InfraModule } from './infra/infra.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { ExpressAdapter } from '@bull-board/express';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    InfraModule,
    QueuesModule,
    HttpModule,
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
  ],
  controllers: [AppController, OrdersController],
  providers: [
    AppService,
    IdempotencyInterceptor,
    IdempotencyService,
    {
      provide: GetOrderUseCase,
      useFactory: (repo: OrderRepository) => new GetOrderUseCase(repo),
      inject: [ORDER_REPOSITORY],
    },
    {
      provide: ListOrdersUseCase,
      useFactory: (repo: OrderRepository) => new ListOrdersUseCase(repo),
      inject: [ORDER_REPOSITORY],
    },
    {
      provide: CreateOrderUseCase,
      useFactory: (repo: OrderRepository) => new CreateOrderUseCase(repo),
      inject: [ORDER_REPOSITORY],
    },
    {
      provide: MarkOrderPaidUseCase,
      useFactory: (repo: OrderRepository) => new MarkOrderPaidUseCase(repo),
      inject: [ORDER_REPOSITORY],
    },
  ],
})
export class AppModule {}
