# Al Aroma - Makefile
# Удобные команды для управления проектом

.PHONY: help dev prod up down logs clean backup restore restart health

# Default target
.DEFAULT_GOAL := help

# Colors
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
NC := \033[0m

help: ## Показать эту справку
	@echo "$(BLUE)Al Aroma - Система управления торговлей$(NC)"
	@echo ""
	@echo "Доступные команды:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-15s$(NC) %s\n", $$1, $$2}'

dev: ## Запустить в режиме разработки
	@echo "$(YELLOW)Запуск в режиме разработки...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)✓ Сервисы запущены$(NC)"
	@echo "Frontend: http://localhost:3001"
	@echo "Backend: http://localhost:3000"
	@echo "PgAdmin: http://localhost:5050"

prod: ## Запустить в production режиме
	@echo "$(YELLOW)Запуск в production режиме...$(NC)"
	docker-compose -f docker-compose.prod.yml up -d
	@echo "$(GREEN)✓ Production сервисы запущены$(NC)"

up: dev ## Alias для dev

down: ## Остановить все сервисы
	@echo "$(YELLOW)Остановка сервисов...$(NC)"
	docker-compose down
	@echo "$(GREEN)✓ Сервисы остановлены$(NC)"

stop: down ## Alias для down

restart: ## Перезапустить все сервисы
	@echo "$(YELLOW)Перезапуск сервисов...$(NC)"
	docker-compose restart
	@echo "$(GREEN)✓ Сервисы перезапущены$(NC)"

logs: ## Показать логи всех сервисов
	docker-compose logs -f

logs-backend: ## Показать логи backend
	docker-compose logs -f backend

logs-frontend: ## Показать логи frontend
	docker-compose logs -f frontend

logs-db: ## Показать логи базы данных
	docker-compose logs -f postgres

logs-nginx: ## Показать логи nginx
	docker-compose logs -f nginx

ps: ## Показать статус контейнеров
	docker-compose ps

health: ## Проверить health status
	@echo "$(YELLOW)Проверка состояния сервисов...$(NC)"
	@curl -s http://localhost/health || echo "$(RED)Nginx недоступен$(NC)"
	@curl -s http://localhost:3000/health || echo "$(RED)Backend недоступен$(NC)"
	@curl -s http://localhost:3001 > /dev/null && echo "$(GREEN)Frontend OK$(NC)" || echo "$(RED)Frontend недоступен$(NC)"

clean: ## Удалить все контейнеры, сети и volumes
	@echo "$(YELLOW)⚠ ВНИМАНИЕ: Все данные будут удалены!$(NC)"
	@read -p "Вы уверены? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker-compose down -v --remove-orphans; \
		echo "$(GREEN)✓ Очистка завершена$(NC)"; \
	else \
		echo "$(GREEN)Очистка отменена$(NC)"; \
	fi

build: ## Пересобрать все образы
	@echo "$(YELLOW)Пересборка образов...$(NC)"
	docker-compose build --no-cache
	@echo "$(GREEN)✓ Образы пересобраны$(NC)"

rebuild: ## Пересобрать и перезапустить
	@echo "$(YELLOW)Пересборка и перезапуск...$(NC)"
	docker-compose up -d --build
	@echo "$(GREEN)✓ Готово$(NC)"

backup: ## Создать резервную копию
	@echo "$(YELLOW)Создание резервной копии...$(NC)"
	docker-compose -f docker-compose.prod.yml run --rm backup
	@echo "$(GREEN)✓ Резервная копия создана$(NC)"

restore: ## Восстановить из резервной копии
	@echo "$(YELLOW)Доступные резервные копии:$(NC)"
	@ls -lh backups/postgres/*.sql.gz 2>/dev/null || echo "Резервные копии не найдены"
	@read -p "Введите путь к файлу резервной копии: " backup_file; \
	docker-compose exec postgres /bin/sh /backups/restore.sh "$$backup_file"

shell-backend: ## Подключиться к backend контейнеру
	docker-compose exec backend sh

shell-frontend: ## Подключиться к frontend контейнеру
	docker-compose exec frontend sh

shell-db: ## Подключиться к PostgreSQL
	docker-compose exec postgres psql -U alaroma_user alaroma

db-reset: ## Пересоздать базу данных
	@echo "$(YELLOW)⚠ ВНИМАНИЕ: База данных будет пересоздана!$(NC)"
	@read -p "Вы уверены? (yes/no): " confirm; \
	if [ "$$confirm" = "yes" ]; then \
		docker-compose down postgres; \
		docker volume rm alaroma_postgres_data || true; \
		docker-compose up -d postgres; \
		echo "$(GREEN)✓ База данных пересоздана$(NC)"; \
	else \
		echo "$(GREEN)Отменено$(NC)"; \
	fi

install: ## Первоначальная установка
	@echo "$(BLUE)Al Aroma - Первоначальная установка$(NC)"
	@echo ""
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)✓ Создан .env файл$(NC)"; \
		echo "$(YELLOW)⚠ ВАЖНО: Отредактируйте .env и измените пароли!$(NC)"; \
	else \
		echo "$(YELLOW).env файл уже существует$(NC)"; \
	fi
	@mkdir -p backups/postgres backups/redis backups/uploads
	@echo "$(GREEN)✓ Созданы директории для резервных копий$(NC)"
	@echo ""
	@echo "$(GREEN)Установка завершена. Выполните 'make dev' для запуска$(NC)"

update: ## Обновить зависимости и образы
	@echo "$(YELLOW)Обновление...$(NC)"
	docker-compose pull
	docker-compose build --pull
	@echo "$(GREEN)✓ Обновление завершено$(NC)"

test: ## Запустить тесты
	docker-compose exec backend npm test
	docker-compose exec frontend npm test

lint: ## Проверить код
	docker-compose exec backend npm run lint
	docker-compose exec frontend npm run lint

format: ## Отформатировать код
	docker-compose exec backend npm run format
	docker-compose exec frontend npm run format

pgadmin: ## Запустить PgAdmin
	docker-compose --profile tools up -d pgadmin
	@echo "$(GREEN)PgAdmin доступен: http://localhost:5050$(NC)"

.env: ## Создать .env из примера
	cp .env.example .env
	@echo "$(GREEN)✓ .env файл создан. Не забудьте изменить пароли!$(NC)"
