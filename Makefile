.PHONY: dev

dev:
	pnpm --parallel --filter orders --filter payments-worker start:dev