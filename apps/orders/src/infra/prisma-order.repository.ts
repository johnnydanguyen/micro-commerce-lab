import { OrderRepository } from './order.repository';
import { Order } from '../domain/order';
import { OrderItem } from '../domain/order-item';
import { Money } from '../domain/money';
import { PrismaService } from './prisma.service';

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(order: Order): Promise<void> {
    await this.prisma.order.upsert({
      where: { id: order.id },
      create: {
        id: order.id,
        userId: order.userId,
        status: order.status,
        totalCents: order.totalAmount.cents,
        items: {
          createMany: {
            data: order.items.map((it) => ({
              id: crypto.randomUUID(),
              productId: it.productId,
              qty: it.qty,
              unitPriceCents: it.unitPrice.cents,
            })),
          },
        },
      },
      update: {
        status: order.status,
        totalCents: order.totalAmount.cents,
      },
    });
  }

  async findById(id: string): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!row) return null;

    const items = row.items.map(
      (it) => new OrderItem(it.productId, it.qty, new Money(it.unitPriceCents)),
    );

    // Re-hydrate domain without breaking invariants.
    // Cách sạch: tạo một factory "rehydrate" trong Order.
    // Day 3 làm nhanh: dùng create rồi set status (vì status chỉ 3 cái).
    const order = Order.create(row.userId, items);

    // override id & status theo DB (hack nhẹ cho Day 3)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    (order as any).id = row.id;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    order.status = row.status as any;

    return order;
  }
}
