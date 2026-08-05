SHELL := /bin/bash

.PHONY: init lock setup up dev logs down reset seed monitoring dev-test test lint build validate validate-full terraform-fmt terraform-validate

init:
	./infrastructure/bash/init-env.sh

lock:
	./infrastructure/bash/generate-lockfiles.sh

setup: init
	npm --prefix backend install --no-audit --no-fund
	npm --prefix frontend install --no-audit --no-fund

up: init
	docker compose up --build -d
	docker compose ps

dev: init
	docker compose up --build

logs:
	docker compose logs -f --tail=100

down:
	docker compose down --remove-orphans

reset:
	docker compose down --volumes --remove-orphans

seed:
	docker compose --profile tools run --rm seed

monitoring:
	docker compose --profile monitoring up -d prometheus grafana

dev-test:
	npm --prefix backend test
	npm --prefix frontend test

test: dev-test

lint:
	npm --prefix backend run lint
	npm --prefix frontend run lint

build:
	npm --prefix backend run build
	npm --prefix frontend run build

validate:
	./infrastructure/bash/validate-local.sh static

validate-full:
	./infrastructure/bash/validate-local.sh full

terraform-fmt:
	terraform -chdir=infrastructure/terraform fmt -recursive

terraform-validate:
	terraform -chdir=infrastructure/terraform init -backend=false
	terraform -chdir=infrastructure/terraform validate
