import { OrderRepository } from './order.repository';
import { Order, OrderStatus } from '../domain/order';
import { OrderItem } from '../domain/order-item';
import { Money } from '../domain/money';
import { PrismaService } from './prisma.service';
import { OutboxStatus } from '@prisma/client';

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

  async saveWithOutbox(
    order: Order,
    outbox: { eventType: string; payload: unknown },
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.order.create({
        data: {
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
      });

      await tx.outboxEvent.create({
        data: {
          eventType: outbox.eventType,
          payload: outbox.payload as object,
          status: OutboxStatus.PENDING,
        },
      });
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

  async listPendingOutbox(limit: number) {
    const rows = await this.prisma.outboxEvent.findMany({
      where: {
        status: OutboxStatus.PENDING,
        availableAt: { lte: new Date() },
      },
      orderBy: [{ createdAt: 'asc' }],
      take: Math.min(Math.max(limit, 1), 100),
    });

    return rows.map((row) => ({
      id: row.id,
      eventType: row.eventType,
      payload: row.payload,
      retryCount: row.retryCount,
    }));
  }

  async markOutboxSent(id: string): Promise<void> {
    await this.prisma.outboxEvent.update({
      where: { id },
      data: {
        status: OutboxStatus.SENT,
        sentAt: new Date(),
        lastError: null,
      },
    });
  }

  async markOutboxRetry(id: string, error: string): Promise<void> {
    const row = await this.prisma.outboxEvent.findUnique({ where: { id } });
    if (!row) return;

    const nextRetryCount = row.retryCount + 1;
    const delaySeconds = Math.min(2 ** nextRetryCount, 300);

    await this.prisma.outboxEvent.update({
      where: { id },
      data: {
        retryCount: { increment: 1 },
        lastError: error.slice(0, 500),
        availableAt: new Date(Date.now() + delaySeconds * 1000),
      },
    });
  }
}
