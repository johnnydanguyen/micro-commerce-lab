import { Order } from '../domain/order';

export type OutboxEventInput = {
  eventType: string;
  payload: unknown;
};

export type PendingOutboxEvent = {
  id: string;
  eventType: string;
  payload: unknown;
  retryCount: number;
};

export interface OrderRepository {
  save(order: Order): Promise<void>;
  saveWithOutbox(order: Order, outbox: OutboxEventInput): Promise<void>;
  findById(id: string): Promise<Order | null>;
  list(params: {
    limit: number;
    nextCursor?: string;
  }): Promise<{ orders: Order[]; nextCursor: string | null }>;
  listPendingOutbox(limit: number): Promise<PendingOutboxEvent[]>;
  markOutboxSent(id: string): Promise<void>;
  markOutboxRetry(id: string, error: string): Promise<void>;
}
