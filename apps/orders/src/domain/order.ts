import { Money } from './money';
import { OrderItem } from './order-item';

export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED';
export type OrderEvent = 'PAY' | 'CANCEL';

const TRANSITIONS: Record<
  OrderStatus,
  Partial<Record<OrderEvent, OrderStatus>>
> = {
  PENDING: {
    PAY: 'PAID',
    CANCEL: 'CANCELLED',
  },
  PAID: {},
  CANCELLED: {},
};

export type OrderRow = {
  id: string;
  userId: string;
  status: OrderStatus;
  items: OrderItem[];
  totalCents: number;
};

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

  static rehydrate(params: OrderRow): Order {
    const { id, userId, status, items, totalCents } = params;

    if (!id) throw new Error('id required');
    if (!userId) throw new Error('userId required');
    if (!items || items.length === 0) throw new Error('items required');

    const computed = items.reduce(
      (acc, it) => acc.add(it.total()),
      new Money(0),
    );
    if (computed.cents !== totalCents) {
      throw new Error(
        `corrupted total: expected ${computed.cents}, got ${totalCents}`,
      );
    }

    return new Order(id, userId, items, new Money(totalCents), status);
  }

  private transition(event: OrderEvent): void {
    const nextStatus = TRANSITIONS[this.status][event];
    if (!nextStatus) {
      throw new Error(`invalid transition: ${this.status} -> ${event}`);
    }
    this.status = nextStatus;
  }

  markPaid(): void {
    this.transition('PAY');
  }

  cancel(): void {
    this.transition('CANCEL');
  }
}
