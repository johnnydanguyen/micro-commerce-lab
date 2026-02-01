import { Money } from './money';

export class OrderItem {
  constructor(
    public readonly productId: string,
    public readonly qty: number,
    public readonly unitPrice: Money,
  ) {
    if (!productId) throw new Error('Product ID must be provided');
    if (!Number.isInteger(qty) || qty <= 0)
      throw new Error('Quantity must be a positive integer');
  }

  total(): Money {
    return this.unitPrice.mul(this.qty);
  }
}
