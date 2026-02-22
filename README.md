Jan 31, 2026

- [x] Scaffold monorepo with 2 NestJS apps (orders, payments-worker)
- [x] Setup docker compose: postgres + redis
- [x] Run /health successfully on 2 apps

Feb 1, 2026

- [x] Scaffold folders domain, infra, application
- [x] Initiate CreateOrderUseCase and related components
- [x] Set up unit tests

Feb 2, 2026

- [x] Persist data with Prisma
- [x] Add integration tests

7 Feb, 2026

- [x] GET /orders/:id
- [x] GET /orders list + nextCursor
- [x] index orders(createdAt, id)

8 Feb, 2026

- [x] Create new order with idempotent key handling

19 Feb, 2026

- [x] Setup payment producer and consumer

22 Feb, 2026

- [x] Add new controller to mark order paid
- [x] Call mark order paid in payment consumer