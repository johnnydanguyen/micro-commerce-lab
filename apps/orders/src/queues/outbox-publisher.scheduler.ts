import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';

@Injectable()
export class OutboxPublisherScheduler implements OnModuleInit {
  constructor(
    @InjectQueue('outbox-publisher')
    private readonly outboxQueue: Queue,
  ) {}

  async onModuleInit() {
    await this.outboxQueue.add(
      'publish-pending-outbox',
      {},
      {
        jobId: 'publish-pending-outbox-loop',
        repeat: { every: 5000 },
        removeOnComplete: true,
        removeOnFail: true,
      },
    );
  }
}
