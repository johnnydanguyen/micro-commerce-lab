# Terraform Layout

This folder is organized into reusable modules and environment-specific stacks.

## Structure

- `modules/`: reusable building blocks (`app-cloud-run`, `artifact-registry`, `redis`, `cloud-sql`)
- `stacks/`: deployable entry points
  - `platform`: shared infra (APIs, Artifact Registry, runtime SA, optional Redis/Cloud SQL)
  - `orders-app`: Cloud Run orders service
  - `payments-app`: Cloud Run payments worker
- `environments/`: `backend.hcl` and `app.auto.tfvars` templates by environment

## Typical Commands

### Platform stack

```bash
cd .cicd/terraform/stacks/platform
terraform init -backend-config=../../environments/dev/backend.hcl
terraform plan -var-file=../../environments/dev/app.auto.tfvars
terraform apply -var-file=../../environments/dev/app.auto.tfvars
```

### Orders app stack

```bash
cd .cicd/terraform/stacks/orders-app
terraform init -backend-config=../../environments/dev/backend.hcl
terraform plan -var-file=../../environments/dev/app.auto.tfvars
terraform apply -var-file=../../environments/dev/app.auto.tfvars
```

### Payments app stack

```bash
cd .cicd/terraform/stacks/payments-app
terraform init -backend-config=../../environments/dev/backend.hcl
terraform plan \
  -var='project_id=REPLACE' \
  -var='region=us-central1' \
  -var='image=us-central1-docker.pkg.dev/REPLACE/micro-commerce/payments-worker:latest' \
  -var='redis_host=REPLACE'
terraform apply # same vars as plan
```

## Notes

- Keep shared infrastructure in `platform` and app deploys in app stacks to reduce blast radius.
- Prefer remote state (GCS backend) for CI/CD.
- Store secrets in GitHub Secrets or Secret Manager; avoid committing real values in tfvars.
