import { OrderItemDto } from './get-order.dto';

export type CreateOrderBodyDto = {
  userId: string;
  items: OrderItemDto[];
};
