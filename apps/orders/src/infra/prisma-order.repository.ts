import { OrderRepository } from './order.repository';
import { Order, OrderStatus } from '../domain/order';
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

  async list(params: {
    limit: number;
    nextCursor?: string;
  }): Promise<{ orders: Order[]; nextCursor: string | null }> {
    const take = Math.min(Math.max(params.limit, 1), 100);

    const rows = await this.prisma.order.findMany({
      take: take + 1, // lấy dư 1 để biết còn trang sau
      ...(params.nextCursor
        ? {
            skip: 1,
            cursor: { id: params.nextCursor },
          }
        : {}),
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      include: { items: true },
    });

    const hasNext = rows.length > take;
    const page = hasNext ? rows.slice(0, take) : rows;

    const orders = page.map((row) => {
      const items = row.items.map(
        (it) =>
          new OrderItem(it.productId, it.qty, new Money(it.unitPriceCents)),
      );
      return Order.rehydrate({
        id: row.id,
        userId: row.userId,
        status: row.status as OrderStatus,
        items,
        totalCents: row.totalCents, // nếu snapshot có
      });
    });

    const nextCursor = hasNext ? page[page.length - 1].id : null;
    return { orders, nextCursor };
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

    return Order.rehydrate({
      id: row.id,
      userId: row.userId,
      status: row.status as OrderStatus,
      totalCents: row.totalCents,
      items,
    });
  }
}
