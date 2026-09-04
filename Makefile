SHELL := /usr/bin/env bash
.DEFAULT_GOAL := help

ENV ?= dev
BACKUP ?=
ROLLBACK_SHA ?=
COMPOSE_FILE ?= compose.yaml
COMPOSE := docker compose -f $(COMPOSE_FILE) --env-file .env

.PHONY: help plan-check bootstrap install dev lint typecheck test build up down restart logs ps health migrate seed admin-create backup restore restore-drill deploy rollback clean-safe preflight-production

help: ## Show available targets
	@awk 'BEGIN {FS = ":.*## "; printf "Usage: make <target> [ENV=dev|production]\n\n"} /^[a-zA-Z0-9_-]+:.*## / {printf "  %-22s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

plan-check: ## Verify the planning pack before implementation
	@test -f AGENTS.md
	@test -f docs/PRD.md
	@test -f docs/TRACEABILITY.csv
	@test -f DECISIONS.md
	@echo "Planning pack is present."

bootstrap: ## Verify tools and initialize safe local directories
	@./infra/scripts/bootstrap.sh "$(ENV)"

install: ## Install exact dependencies from the lockfile
	@corepack enable
	@pnpm install --frozen-lockfile

dev: ## Run development with explicit mocks
	@./infra/scripts/dev.sh

lint: ## Run lint and repository policy checks
	@pnpm lint

typecheck: ## Run strict TypeScript checks
	@pnpm typecheck

test: ## Run unit and integration tests
	@pnpm test

build: ## Build the backend application and production image
	@pnpm build
	@$(COMPOSE) build

up: ## Start the selected Compose environment
	@$(COMPOSE) up -d --remove-orphans

down: ## Stop services without deleting persistent data
	@$(COMPOSE) down --remove-orphans

restart: ## Restart services safely
	@$(COMPOSE) restart

logs: ## Tail bounded service logs
	@$(COMPOSE) logs --tail=300 -f

ps: ## Show Compose service state
	@$(COMPOSE) ps

health: ## Check app, provider, storage, disk, queue, and backup health
	@ENV="$(ENV)" ./infra/scripts/health.sh

migrate: ## Run forward migrations with a deployment lock
	@ENV="$(ENV)" ./infra/scripts/migrate.sh

seed: ## Load synthetic development/test data only
	@ENV="$(ENV)" ./infra/scripts/seed.sh

admin-create: ## Create the first superadmin and start TOTP enrollment
	@ENV="$(ENV)" ./infra/scripts/admin-create.sh

backup: ## Create encrypted, checksummed database and upload backups
	@ENV="$(ENV)" ./infra/scripts/backup.sh

restore: ## Restore explicit dev backup: make restore ENV=dev BACKUP=var/backups/daily/...dump.age
	@ENV="$(ENV)" BACKUP="$(BACKUP)" ./infra/scripts/restore.sh

restore-drill: ## Restore a backup into isolated dev drill database (explicit confirmation required)
	@ENV="$(ENV)" BACKUP="$(BACKUP)" ./infra/scripts/restore-drill.sh

preflight-production: ## Fail closed on mocks, placeholders, missing approvals, and unsafe config
	@ENV=production ./infra/scripts/preflight-production.sh

deploy: ## Backup, build, migrate, deploy, verify, and roll back on failure
	@ENV="$(ENV)" ./infra/scripts/deploy.sh

rollback: ## Restore recorded application image: make rollback ENV=production ROLLBACK_SHA=<sha>
	@ENV="$(ENV)" ROLLBACK_SHA="$(ROLLBACK_SHA)" ./infra/scripts/rollback.sh

clean-safe: ## Remove build/test caches; never persistent var data
	@./infra/scripts/clean-safe.sh
