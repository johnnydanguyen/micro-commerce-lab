import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PaymentsProducer } from './payments.producer';
import { OutboxPublisherProcessor } from './outbox-publisher.processor';
import { OutboxPublisherScheduler } from './outbox-publisher.scheduler';
import { InfraModule } from '../infra/infra.module';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    InfraModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
      },
    }),
    BullModule.registerQueue({
      name: 'payments',
    }),
    BullModule.registerQueue({
      name: 'outbox-publisher',
    }),
    BullBoardModule.forFeature(
      {
        name: 'payments',
        adapter: BullMQAdapter,
      },
      {
        name: 'outbox-publisher',
        adapter: BullMQAdapter,
      },
    ),
  ],
  providers: [
    PaymentsProducer,
    OutboxPublisherProcessor,
    OutboxPublisherScheduler,
  ],
  exports: [PaymentsProducer],
})
export class QueuesModule {}
