import { Money } from './money';
import { Order } from './order';
import { OrderItem } from './order-item';

describe('Order domain', () => {
  it('should create an order and calculate total amount', () => {
    const items = [
      new OrderItem('p1', 2, new Money(1000)),
      new OrderItem('p2', 1, new Money(500)),
    ];
    const order = Order.create('u1', items);

    expect(order.status).toBe('PENDING');
    expect(order.totalAmount.cents).toBe(2500);
  });

  it('should reject empty items', () => {
    expect(() => Order.create('u1', [])).toThrow();
  });

  it('state transitions: cannot cancel paid', () => {
    const order = Order.create('u1', [new OrderItem('p1', 1, new Money(1000))]);
    order.markPaid();
    expect(() => order.cancel()).toThrow();
  });
});
