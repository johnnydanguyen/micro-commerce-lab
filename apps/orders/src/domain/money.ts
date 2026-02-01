export class Money {
  constructor(public readonly cents: number) {
    if (!Number.isInteger(cents)) throw new Error('Cents must be an integer');
    if (cents < 0) throw new Error('Cents must be non-negative');
  }

  add(other: Money): Money {
    return new Money(this.cents + other.cents);
  }

  mul(factor: number): Money {
    if (!Number.isInteger(factor) || factor < 0) {
      throw new Error('Factor must be non-negative');
    }
    return new Money(Math.round(this.cents * factor));
  }
}
