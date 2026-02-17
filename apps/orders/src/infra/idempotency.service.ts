import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from './prisma.service';

type IdempotencyClient = Prisma.TransactionClient | PrismaService;

export type IdempotencyRecord = {
  key: string;
  route: string;
  requestHash: string;
  statusCode: number;
  responseBody: Prisma.InputJsonValue;
};

@Injectable()
export class IdempotencyService {
  constructor(private readonly prisma: PrismaService) {}

  async transaction<T>(handler: (tx: Prisma.TransactionClient) => Promise<T>) {
    return this.prisma.$transaction((tx) => handler(tx));
  }

  async findByKey(key: string, client?: IdempotencyClient) {
    const db = client ?? this.prisma;
    return db.idempotencyKey.findUnique({ where: { key } });
  }

  async create(data: IdempotencyRecord, client?: IdempotencyClient) {
    const db = client ?? this.prisma;
    await db.idempotencyKey.create({ data });
  }

  async updateByKey(
    key: string,
    data: Pick<IdempotencyRecord, 'statusCode' | 'responseBody'>,
    client?: IdempotencyClient,
  ) {
    const db = client ?? this.prisma;
    await db.idempotencyKey.update({ where: { key }, data });
  }

  async beginOrReplay(params: {
    key: string;
    route: string;
    requestHash: string;
  }): Promise<
    | { kind: 'REPLAY'; statusCode: number; body: Prisma.JsonValue }
    | { kind: 'BEGIN' }
    | { kind: 'IN_PROGRESS' }
  > {
    const existing = await this.findByKey(params.key);

    if (!existing) {
      // First time seeing this key - create a new record with IN_PROGRESS status
      await this.create({
        key: params.key,
        route: params.route,
        requestHash: params.requestHash,
        statusCode: 0, // 0 means in progress
        responseBody: {},
      });
      return { kind: 'BEGIN' };
    }

    // Check if route and hash match
    if (
      existing.route !== params.route ||
      existing.requestHash !== params.requestHash
    ) {
      throw new Error('Idempotency key reused for different request');
    }

    // If statusCode is 0, it's still in progress
    if (existing.statusCode === 0) {
      return { kind: 'IN_PROGRESS' };
    }

    // Otherwise, replay the cached response
    return {
      kind: 'REPLAY',
      statusCode: existing.statusCode,
      body: existing.responseBody,
    };
  }

  async complete(
    key: string,
    data: { statusCode: number; responseBody: Prisma.InputJsonValue },
  ): Promise<void> {
    await this.updateByKey(key, {
      statusCode: data.statusCode,
      responseBody: data.responseBody,
    });
  }

  async fail(
    key: string,
    data: { statusCode: number; responseBody: Prisma.InputJsonValue },
  ): Promise<void> {
    await this.updateByKey(key, {
      statusCode: data.statusCode,
      responseBody: data.responseBody,
    });
  }
}
