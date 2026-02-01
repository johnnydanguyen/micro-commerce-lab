import { CreateOrderUseCase } from './create-order.usecase';
import { InMemoryOrderRepository } from '../infra/in-memory-order.repository';

describe('CreateOrderUseCase', () => {
  it('creates order and saves it', async () => {
    const repo = new InMemoryOrderRepository();
    const uc = new CreateOrderUseCase(repo);

    const out = await uc.execute({
      userId: 'u1',
      items: [{ productId: 'p1', qty: 2, unitPriceCents: 1000 }],
    });

    expect(out.status).toBe('PENDING');
    expect(out.totalCents).toBe(2000);

    const saved = await repo.findById(out.id);
    expect(saved).not.toBeNull();
    expect(saved!.totalAmount.cents).toBe(2000);
  });

  it('rejects negative price', async () => {
    const repo = new InMemoryOrderRepository();
    const uc = new CreateOrderUseCase(repo);

    await expect(
      uc.execute({
        userId: 'u1',
        items: [{ productId: 'p1', qty: 1, unitPriceCents: -1 }],
      }),
    ).rejects.toThrow();
  });
});
