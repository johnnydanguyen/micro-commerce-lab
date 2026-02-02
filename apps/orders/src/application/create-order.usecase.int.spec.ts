import { Test } from '@nestjs/testing';
import { PrismaService } from '../infra/prisma.service';
import { PrismaOrderRepository } from '../infra/prisma-order.repository';
import { CreateOrderUseCase } from './create-order.usecase';

import { config } from 'dotenv';
config();

describe('CreateOrderUseCase (integration)', () => {
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    prisma = moduleRef.get(PrismaService);
  });

  beforeEach(async () => {
    // dọn dữ liệu để test repeatable
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
  });

  afterAll(async () => {
    if (prisma) await prisma.$disconnect();
  });

  it('persists order to Postgres', async () => {
    const repo = new PrismaOrderRepository(prisma);
    const uc = new CreateOrderUseCase(repo);

    const out = await uc.execute({
      userId: 'u1',
      items: [
        { productId: 'p1', qty: 2, unitPriceCents: 1000 },
        { productId: 'p2', qty: 1, unitPriceCents: 2500 },
      ],
    });

    const dbOrder = await prisma.order.findUnique({
      where: { id: out.id },
      include: { items: true },
    });

    expect(dbOrder).not.toBeNull();
    expect(dbOrder!.totalCents).toBe(4500);
    expect(dbOrder!.items.length).toBe(2);
  });
});
