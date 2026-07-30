SHELL := /bin/bash

.PHONY: setup dev down test lint build migrate seed terraform-fmt terraform-validate

setup:
	cp -n .env.example .env || true
	npm --prefix backend install
	npm --prefix frontend install

dev:
	docker compose up --build

down:
	docker compose down -v

test:
	npm --prefix backend test
	npm --prefix frontend test

lint:
	npm --prefix backend run lint
	npm --prefix frontend run lint

build:
	npm --prefix backend run build
	npm --prefix frontend run build

migrate:
	docker compose exec backend npm run prisma:migrate:deploy

seed:
	docker compose exec backend npm run prisma:seed:prod

terraform-fmt:
	terraform -chdir=infrastructure/terraform fmt -recursive

terraform-validate:
	terraform -chdir=infrastructure/terraform init -backend=false
	terraform -chdir=infrastructure/terraform validate
