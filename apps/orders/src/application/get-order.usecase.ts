import { OrderRepository } from '../infra/order.repository';
import { GetOrderResponseDto } from './get-order.dto';

export class GetOrderUseCase {
  constructor(private readonly repo: OrderRepository) {}

  async execute(id: string): Promise<GetOrderResponseDto | null> {
    const order = await this.repo.findById(id);
    if (!order) return null;

    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      totalCents: order.totalAmount.cents,
      items: order.items.map((it) => ({
        productId: it.productId,
        qty: it.qty,
        unitPriceCents: it.unitPrice.cents,
      })),
    };
  }
}
