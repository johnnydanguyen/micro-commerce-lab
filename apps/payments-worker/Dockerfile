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

COPY apps/payments-worker apps/payments-worker

RUN pnpm --filter payments-worker build

FROM node:20-alpine AS runtime
WORKDIR /workspace

COPY --from=build /workspace /workspace

CMD ["node", "apps/payments-worker/dist/src/main.js"]
