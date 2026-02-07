import type { OrderStatus } from '../domain/order';

export type OrderItemDto = {
  productId: string;
  qty: number;
  unitPriceCents: number;
};

export type GetOrderResponseDto = {
  id: string;
  userId: string;
  status: OrderStatus;
  totalCents: number;
  items: OrderItemDto[];
};
