import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { ORDER_REPOSITORY } from './tokens';
import { PrismaOrderRepository } from './prisma-order.repository';

@Module({
  providers: [
    PrismaService,
    {
      provide: ORDER_REPOSITORY,
      useFactory: (prisma: PrismaService) => new PrismaOrderRepository(prisma),
      inject: [PrismaService],
    },
  ],
  exports: [PrismaService, ORDER_REPOSITORY],
})
export class InfraModule {}
