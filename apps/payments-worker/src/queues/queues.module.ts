import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { PaymentsConsumer } from './payments.consumer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST ?? 'localhost',
        port: Number(process.env.REDIS_PORT ?? 6379),
        username: process.env.REDIS_USERNAME ?? 'default',
        password: process.env.REDIS_PASSWORD ?? '',
      },
    }),
    BullModule.registerQueue({
      name: 'payments',
    }),
  ],
  providers: [PaymentsConsumer],
})
export class QueuesModule {}
