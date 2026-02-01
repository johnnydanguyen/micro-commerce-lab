import { Money } from './money';
import { OrderItem } from './order-item';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export class Order {
  private constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: Money,
    public status: OrderStatus,
  ) {}

  static create(userId: string, items: OrderItem[]): Order {
    if (!userId) throw new Error('User ID must be provided');
    if (items.length === 0)
      throw new Error('Order must have at least one item');

    const total = items.reduce(
      (acc, item) => acc.add(item.total()),
      new Money(0),
    );
    const id = crypto.randomUUID();

    return new Order(id, userId, items, total, 'PENDING');
  }

  markPaid(): void {
    if (this.status === 'CANCELLED') {
      throw new Error('Cannot pay a cancelled order');
    }
    this.status = 'PAID';
  }

  cancel(): void {
    if (this.status === 'PAID') {
      throw new Error('Cannot cancel a paid order');
    }
    this.status = 'CANCELLED';
  }
}
