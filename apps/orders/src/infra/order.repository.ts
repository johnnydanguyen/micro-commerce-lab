import { Order } from 'src/domain/order';

export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | null>;
  list(params: {
    limit: number;
    nextCursor?: string;
  }): Promise<{ orders: Order[]; nextCursor: string | null }>;
}
