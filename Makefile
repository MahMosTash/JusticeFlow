.PHONY: help build up down logs clean test backend-test frontend-test

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-15s %s\n", $$1, $$2}'

build: ## Build Docker images
	docker-compose build

up: ## Start all services
	docker-compose up -d

down: ## Stop all services
	docker-compose down

logs: ## View logs
	docker-compose logs -f

clean: ## Clean up Docker volumes and containers
	docker-compose down -v
	docker system prune -f

test: backend-test frontend-test ## Run all tests

backend-test: ## Run backend tests
	cd backend && python manage.py test --settings=config.settings.testing

frontend-test: ## Run frontend tests
	cd frontend && npm test -- --watchAll=false

migrate: ## Run database migrations
	cd backend && python manage.py migrate

createsuperuser: ## Create Django superuser
	cd backend && python manage.py createsuperuser

create-roles: ## Create initial roles
	cd backend && python manage.py create_initial_roles

shell: ## Open Django shell
	cd backend && python manage.py shell

