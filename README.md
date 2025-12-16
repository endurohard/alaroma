# Al Aroma - Система управления торговлей

Комплексная система управления торговлей с функциями складского учета, продаж и аналитики.

## Возможности системы

### Управление складами
- **Центральный склад** - общее управление запасами и распределение товаров
- **Торговые точки** - каждая точка имеет свой склад и ведет продажи
- **Перемещение товаров** - автоматический учет между складами и точками
- **Инвентаризация** - списания, контроль брака и просрочки

### Система продаж
- **POS-терминал** - оформление продаж и работа с кассой
- **Акции и скидки**:
  - Скидка на день рождения
  - Акция 1+1=3
  - Комбо-предложение (1500₽ + 700₽ + подарок)
- **Подарочные сертификаты** - с фиксированным номиналом
- **Множественные способы оплаты** - наличные, карты, сертификаты

### Управление доступом
- **Администратор** - полный доступ ко всем функциям
- **Менеджер** - управление складом и списания
- **Кассир** - только продажи
- **Продавец** - продажи и применение скидок
- **Кладовщик** - складской учет

## Технологический стек

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Node.js, NestJS (рекомендуется)
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Reverse Proxy**: Nginx
- **Контейнеризация**: Docker & Docker Compose

## Быстрый старт

### Требования

- Docker 24.0+
- Docker Compose 2.20+
- 4GB свободной RAM (минимум)
- 10GB свободного места на диске

### Установка

1. **Клонируйте репозиторий**
```bash
git clone <repository-url>
cd alaroma
```

2. **Настройте переменные окружения**
```bash
cp .env.example .env
```

Отредактируйте `.env` и измените следующие критичные параметры:
- `POSTGRES_PASSWORD` - пароль базы данных
- `REDIS_PASSWORD` - пароль Redis
- `JWT_SECRET` - секретный ключ для JWT (минимум 32 символа)
- `JWT_REFRESH_SECRET` - секретный ключ для refresh токенов

3. **Запустите в режиме разработки**
```bash
docker-compose up -d
```

Сервисы будут доступны по адресам:
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000
- Nginx (proxy): http://localhost:80
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- PgAdmin: http://localhost:5050 (опционально)

### Запуск с PgAdmin

Для доступа к интерфейсу управления базой данных:

```bash
docker-compose --profile tools up -d
```

PgAdmin будет доступен по адресу: http://localhost:5050

Учетные данные по умолчанию:
- Email: admin@alaroma.local
- Password: changeme

### Остановка сервисов

```bash
docker-compose down
```

Для удаления всех данных (volumes):
```bash
docker-compose down -v
```

## Production deployment

### Подготовка к продакшену

1. **Создайте production .env файл**
```bash
cp .env.example .env.production
```

2. **Настройте production переменные**
Обязательно измените:
- Все пароли на сильные
- `NODE_ENV=production`
- `BUILD_TARGET=production`
- `NEXT_PUBLIC_API_URL` на ваш production домен
- `JWT_SECRET` и `JWT_REFRESH_SECRET` на случайные строки

3. **Запустите production сборку**
```bash
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
```

### SSL/HTTPS настройка

1. Разместите SSL сертификаты в `docker/nginx/ssl/`:
```bash
mkdir -p docker/nginx/ssl
# Скопируйте cert.pem и key.pem
```

2. Раскомментируйте HTTPS server блок в `docker/nginx/conf.d/default.conf`

3. Перезапустите nginx:
```bash
docker-compose restart nginx
```

### Мониторинг и логи

Просмотр логов всех сервисов:
```bash
docker-compose logs -f
```

Просмотр логов конкретного сервиса:
```bash
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

Проверка статуса сервисов:
```bash
docker-compose ps
```

Health check:
```bash
curl http://localhost/health
curl http://localhost:3000/health
```

## Структура проекта

```
alaroma/
├── backend/                 # Backend приложение
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
├── frontend/               # Frontend приложение
│   ├── Dockerfile
│   ├── .dockerignore
│   └── src/
├── docker/                 # Docker конфигурация
│   ├── nginx/
│   │   ├── nginx.conf
│   │   ├── conf.d/
│   │   └── ssl/
│   └── postgres/
│       └── init/
│           └── 01-init.sql  # Инициализация БД
├── backups/                # Резервные копии (создается автоматически)
├── docker-compose.yml      # Development конфигурация
├── docker-compose.prod.yml # Production конфигурация
├── .env.example            # Пример переменных окружения
└── README.md
```

## Схема базы данных

База данных включает следующие основные таблицы:

- **users** - пользователи системы и их роли
- **locations** - склады и торговые точки
- **products** - товары и категории
- **inventory** - остатки товаров по локациям
- **sales** - продажи и чеки
- **promotions** - акции и скидки
- **gift_certificates** - подарочные сертификаты
- **inventory_movements** - движение товаров
- **customers** - клиенты (для программы лояльности)

Полная схема создается автоматически при первом запуске через `docker/postgres/init/01-init.sql`.

## API документация

После запуска backend, API документация будет доступна по адресу:
- Swagger UI: http://localhost:3000/api/docs
- OpenAPI JSON: http://localhost:3000/api/docs-json

## Разработка

### Локальная разработка backend

```bash
cd backend
npm install
npm run dev
```

### Локальная разработка frontend

```bash
cd frontend
npm install
npm run dev
```

### Выполнение миграций

```bash
docker-compose exec backend npm run migration:run
```

### Создание новой миграции

```bash
docker-compose exec backend npm run migration:create -- CreateNewTable
```

## Резервное копирование

### Создание backup базы данных

```bash
docker-compose exec postgres pg_dump -U alaroma_user alaroma > backups/backup_$(date +%Y%m%d_%H%M%S).sql
```

### Восстановление из backup

```bash
docker-compose exec -T postgres psql -U alaroma_user alaroma < backups/backup_20240101_120000.sql
```

### Автоматическое резервное копирование

Production конфигурация включает сервис backup, который можно запустить по расписанию.

Создайте cron job:
```bash
0 2 * * * cd /path/to/alaroma && docker-compose -f docker-compose.prod.yml run --rm backup
```

## Безопасность

### Рекомендации для production

1. **Измените все пароли по умолчанию**
2. **Используйте сильные JWT секреты** (минимум 32 символа)
3. **Настройте HTTPS** с валидными SSL сертификатами
4. **Ограничьте доступ к портам** через firewall
5. **Регулярно обновляйте зависимости**
6. **Включите логирование** и мониторинг
7. **Настройте резервное копирование**
8. **Используйте Docker secrets** для чувствительных данных

### Обновление зависимостей

```bash
# Backend
cd backend
npm audit fix

# Frontend
cd frontend
npm audit fix

# Docker images
docker-compose pull
docker-compose up -d --build
```

## Troubleshooting

### Проблемы с запуском

1. **Порты заняты**
```bash
# Проверьте занятые порты
lsof -i :3000
lsof -i :3001
lsof -i :5432

# Измените порты в .env файле
```

2. **Недостаточно памяти**
```bash
# Увеличьте память для Docker в Docker Desktop настройках
# Или освободите память:
docker system prune -a
```

3. **База данных не инициализируется**
```bash
# Удалите volume и пересоздайте
docker-compose down -v
docker-compose up -d
```

### Логи и отладка

```bash
# Детальные логи
docker-compose logs -f --tail=100 backend

# Подключение к контейнеру
docker-compose exec backend sh
docker-compose exec postgres psql -U alaroma_user alaroma

# Проверка сети
docker network inspect alaroma_alaroma-network
```

## Производительность

### Оптимизация для production

1. **Database**
   - Настроены connection pooling
   - Оптимизированы параметры PostgreSQL
   - Созданы индексы на ключевые поля

2. **Caching**
   - Redis для сессий и кеширования
   - Nginx кеширование статики

3. **Resource limits**
   - Настроены лимиты CPU и памяти для каждого сервиса
   - Health checks для автоматического перезапуска

## Лицензия

Proprietary - All rights reserved

## Поддержка

Для вопросов и поддержки обращайтесь:
- Email: support@alaroma.local
- Documentation: https://docs.alaroma.local
