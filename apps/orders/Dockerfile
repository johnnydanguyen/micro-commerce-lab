FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /workspace

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/orders/package.json apps/orders/package.json
COPY apps/payments-worker/package.json apps/payments-worker/package.json

RUN pnpm install --frozen-lockfile

COPY apps/orders apps/orders

RUN pnpm --filter orders exec prisma generate --schema prisma/schema.prisma
RUN pnpm --filter orders build

FROM node:20-alpine AS runtime
WORKDIR /workspace

COPY --from=build /workspace /workspace

CMD ["node", "apps/orders/dist/src/main"]
