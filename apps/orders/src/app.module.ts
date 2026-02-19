import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './infra/prisma.service';
import { ORDER_REPOSITORY } from './infra/tokens';
import { PrismaOrderRepository } from './infra/prisma-order.repository';
import { OrdersController } from './orders.controller';
import { ConfigModule } from '@nestjs/config';
import { IdempotencyInterceptor } from './infra/idempotency.interceptor';
import { IdempotencyService } from './infra/idempotency.service';
import { QueuesModule } from './queues/queues.module';
import { GetOrderUseCase } from './application/get-order.usecase';
import { OrderRepository } from './infra/order.repository';
import { ListOrdersUseCase } from './application/list-orders.usecase';
import { CreateOrderUseCase } from './application/create-order.usecase';
import { PaymentsProducer } from './queues/payments.producer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    QueuesModule,
  ],
  controllers: [AppController, OrdersController],
  providers: [
    AppService,
    PrismaService,
    IdempotencyInterceptor,
    IdempotencyService,
    {
      provide: ORDER_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaOrderRepository(prisma),
      inject: [PrismaService],
    },
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
      useFactory: (repo: OrderRepository, paymentsProducer: PaymentsProducer) =>
        new CreateOrderUseCase(repo, paymentsProducer),
      inject: [ORDER_REPOSITORY, PaymentsProducer],
    },
  ],
})
export class AppModule {}
