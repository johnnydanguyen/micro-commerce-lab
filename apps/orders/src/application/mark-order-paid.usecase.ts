import { BadRequestException, Injectable } from '@nestjs/common';
import type { OrderRepository } from '../infra/order.repository';

export type MarkOrderPaidInput = {
  orderId: string;
};

export type MarkOrderPaidOutput = {
  id: string;
  status: string;
};

@Injectable()
export class MarkOrderPaidUseCase {
  constructor(private readonly repo: OrderRepository) {}

  async execute(input: MarkOrderPaidInput): Promise<MarkOrderPaidOutput> {
    const order = await this.repo.findById(input.orderId);
    if (!order) {
      throw new BadRequestException('Order not found');
    }

    // Check if already paid (idempotent)
    if (order.status === 'PAID') {
      return {
        id: order.id,
        status: order.status,
      };
    }

    // Mark as paid
    order.markPaid();
    await this.repo.save(order);

    return {
      id: order.id,
      status: order.status,
    };
  }
}
