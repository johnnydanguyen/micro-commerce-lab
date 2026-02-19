import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class PaymentsProducer {
  constructor(@InjectQueue('payments') private readonly paymentsQueue: Queue) {}

  async enqueueProcessPayment(input: { orderId: string; totalCents: number }) {
    console.log('Enqueuing payment processing for order', input.orderId);
    await this.paymentsQueue.add('process-payment', input, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: 1000,
      removeOnFail: 1000,
    });
  }
}
