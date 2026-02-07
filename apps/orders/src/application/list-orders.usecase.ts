import { OrderRepository } from '../infra/order.repository';
import type { OrderStatus } from '../domain/order';

export type ListOrdersInput = {
  limit: number;
  cursor?: string;
};

export type ListOrdersItemDto = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalCents: number;
  createdAt?: string; // optional nếu mày chưa expose
};

export type ListOrdersResponseDto = {
  data: ListOrdersItemDto[];
  nextCursor: string | null;
};

export class ListOrdersUseCase {
  constructor(private readonly repo: OrderRepository) {}

  async execute(input: ListOrdersInput): Promise<ListOrdersResponseDto> {
    const { orders, nextCursor } = await this.repo.list(input);

    return {
      data: orders.map((o) => ({
        id: o.id,
        userId: o.userId,
        status: o.status,
        totalCents: o.totalAmount.cents,
      })),
      nextCursor,
    };
  }
}
