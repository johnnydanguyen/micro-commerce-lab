import { Order } from 'src/domain/order';
import { OrderRepository } from './order.repository';

export class InMemoryOrderRepository implements OrderRepository {
  private readonly store = new Map<string, Order>();

  async save(order: Order): Promise<void> {
    this.store.set(order.id, order);
    return Promise.resolve();
  }

  async findById(id: string): Promise<Order | null> {
    return Promise.resolve(this.store.get(id) || null);
  }
}
