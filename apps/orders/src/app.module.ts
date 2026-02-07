import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './infra/prisma.service';
import { ORDER_REPOSITORY } from './infra/tokens';
import { PrismaOrderRepository } from './infra/prisma-order.repository';
import { OrdersController } from './orders.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [AppController, OrdersController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: ORDER_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaOrderRepository(prisma),
      inject: [PrismaService],
    },
  ],
})
export class AppModule {}
