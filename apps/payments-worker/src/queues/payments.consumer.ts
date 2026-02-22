import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import axios from 'axios';

@Processor('payments')
export class PaymentsConsumer extends WorkerHost {
  async process(job: Job<any, any, string>): Promise<any> {
    switch (job.name) {
      case 'process-payment': {
        const { orderId, totalCents } = job.data as {
          orderId: string;
          totalCents: number;
        };
        // Simulate payment processing
        await new Promise((r) => setTimeout(r, 300));

        // Mark order as paid via Orders API
        const ordersServiceUrl =
          process.env.ORDERS_SERVICE_URL || 'http://localhost:3000';
        try {
          await axios.patch(`${ordersServiceUrl}/orders/${orderId}/mark-paid`);
          console.log(`[payments-worker] marked order ${orderId} as paid`);
        } catch (error) {
          console.error(
            `[payments-worker] failed to mark order ${orderId} as paid`,
            error,
          );
          throw error;
        }

        return { ok: true, orderId, totalCents };
      }
      default:
        return;
    }
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    console.log(`[payments-worker] active job=${job.id} name=${job.name}`);
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    console.log(`[payments-worker] completed job=${job.id}`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    console.log(`[payments-worker] failed job=${job?.id} err=${err.message}`);
  }
}
