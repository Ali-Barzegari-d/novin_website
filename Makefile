SHELL := /usr/bin/env bash
.DEFAULT_GOAL := help

ENV ?= dev
COMPOSE_FILE ?= compose.yaml
COMPOSE := docker compose -f $(COMPOSE_FILE) --env-file .env

.PHONY: help plan-check bootstrap install dev lint typecheck test test-e2e build up down restart logs ps health migrate seed admin-create backup restore deploy rollback clean-safe preflight-production

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

test-e2e: ## Run production-like E2E and accessibility tests
	@pnpm test:e2e

build: ## Build applications and production images
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
	@./infra/scripts/health.sh "$(ENV)"

migrate: ## Run forward migrations with a deployment lock
	@./infra/scripts/migrate.sh "$(ENV)"

seed: ## Load synthetic development/test data only
	@./infra/scripts/seed.sh "$(ENV)"

admin-create: ## Create the first superadmin and start TOTP enrollment
	@./infra/scripts/admin-create.sh "$(ENV)"

backup: ## Create encrypted and checksummed backup
	@./infra/scripts/backup.sh "$(ENV)"

restore: ## Restore one explicit backup with multi-step confirmation
	@./infra/scripts/restore.sh "$(ENV)"

preflight-production: ## Fail closed on mocks, placeholders, missing approvals, and unsafe config
	@./infra/scripts/preflight-production.sh

deploy: ## Backup, build, migrate, deploy, verify, and roll back on failure
	@./infra/scripts/deploy.sh "$(ENV)"

rollback: ## Restore the last known-good application version safely
	@./infra/scripts/rollback.sh "$(ENV)"

clean-safe: ## Remove build/test caches; never persistent var data
	@./infra/scripts/clean-safe.sh
