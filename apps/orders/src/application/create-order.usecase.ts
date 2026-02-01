import { Money } from '../domain/money';
import { Order, OrderStatus } from '../domain/order';
import { OrderItem } from '../domain/order-item';
import { OrderRepository } from '../infra/order.repository';

export type CreateOrderInput = {
  userId: string;
  items: {
    productId: string;
    qty: number;
    unitPriceCents: number;
  }[];
};

export type CreateOrderOutput = {
  id: string;
  status: OrderStatus;
  totalCents: number;
};

export class CreateOrderUseCase {
  constructor(private readonly repo: OrderRepository) {}

  async execute(input: CreateOrderInput): Promise<CreateOrderOutput> {
    const items = input.items.map(
      (i) => new OrderItem(i.productId, i.qty, new Money(i.unitPriceCents)),
    );

    const order = Order.create(input.userId, items);
    await this.repo.save(order);

    return {
      id: order.id,
      status: order.status,
      totalCents: order.totalAmount.cents,
    };
  }
}
