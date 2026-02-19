import { Job } from 'bullmq';
import { PaymentsConsumer } from './payments.consumer';

describe('PaymentsConsumer', () => {
  it('processes "process-payment" job', async () => {
    jest.useFakeTimers();

    const consumer = new PaymentsConsumer();
    const job = {
      name: 'process-payment',
      data: { orderId: 'o1', totalCents: 4500 },
    } as Job<any, any, string>;

    const resultPromise = consumer.process(job);
    jest.advanceTimersByTime(300);

    await expect(resultPromise).resolves.toEqual({
      ok: true,
      orderId: 'o1',
      totalCents: 4500,
    });

    jest.useRealTimers();
  });
});
