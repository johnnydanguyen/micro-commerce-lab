import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ORDER_REPOSITORY } from '../infra/tokens';
import type { OrderRepository } from '../infra/order.repository';
import { PaymentsProducer } from './payments.producer';

@Processor('outbox-publisher')
export class OutboxPublisherProcessor extends WorkerHost {
  private readonly logger = new Logger(OutboxPublisherProcessor.name);

  constructor(
    @Inject(ORDER_REPOSITORY) private readonly repo: OrderRepository,
    private readonly paymentsProducer: PaymentsProducer,
  ) {
    super();
  }

  async process(_job: Job): Promise<{ processed: number }> {
    const events = await this.repo.listPendingOutbox(50);

    for (const event of events) {
      try {
        if (event.eventType === 'OrderCreated') {
          const payload = event.payload as {
            orderId: string;
            totalCents: number;
          };
          await this.paymentsProducer.enqueueProcessPayment({
            orderId: payload.orderId,
            totalCents: payload.totalCents,
          });
        }

        await this.repo.markOutboxSent(event.id);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unknown outbox publish error';
        this.logger.error(`Outbox publish failed id=${event.id}: ${message}`);
        await this.repo.markOutboxRetry(event.id, message);
      }
    }

    return { processed: events.length };
  }
}
