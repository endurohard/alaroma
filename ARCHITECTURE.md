# Al Aroma - Архитектура системы

## Обзор

Al Aroma - это микросервисная система управления торговлей, построенная на современном технологическом стеке с использованием Docker контейнеризации.

## Архитектурная диаграмма

```
┌─────────────────────────────────────────────────────────┐
│                        Клиенты                          │
│         (Браузеры, мобильные приложения)                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                    Nginx (Reverse Proxy)                │
│  - Балансировка нагрузки                                │
│  - SSL/TLS терминация                                   │
│  - Кеширование статики                                  │
│  - Rate limiting                                        │
└──────────────┬─────────────────────┬────────────────────┘
               │                     │
               ▼                     ▼
┌──────────────────────┐  ┌──────────────────────┐
│   Frontend (Next.js) │  │   Backend (Node.js)  │
│  - Server-Side       │  │  - REST API          │
│    Rendering         │  │  - WebSocket         │
│  - Static Assets     │  │  - Business Logic    │
│  - Client Routing    │  │  - Authentication    │
└──────────────────────┘  └─────────┬────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    ▼               ▼               ▼
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │ PostgreSQL   │  │    Redis     │  │ File Storage │
         │ - Main DB    │  │ - Cache      │  │ - Uploads    │
         │ - ACID       │  │ - Sessions   │  │ - Assets     │
         │ - Relations  │  │ - Queue      │  │              │
         └──────────────┘  └──────────────┘  └──────────────┘
```

## Компоненты системы

### 1. Frontend (Next.js)

**Назначение**: Пользовательский интерфейс

**Технологии**:
- Next.js 14 (React framework)
- TypeScript
- TailwindCSS / Material-UI
- React Query (data fetching)
- Zustand / Redux (state management)

**Возможности**:
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- API Routes
- Hot Module Replacement (HMR)
- Automatic code splitting

**Порты**:
- Development: 3001
- Production: 3001 (внутренний)

### 2. Backend (Node.js/NestJS)

**Назначение**: API сервер и бизнес-логика

**Технологии**:
- Node.js 20
- NestJS / Express
- TypeScript
- TypeORM / Prisma
- JWT authentication
- WebSocket support

**Основные модули**:
- **Auth Module**: Аутентификация и авторизация
- **Users Module**: Управление пользователями и ролями
- **Inventory Module**: Управление товарами и складами
- **Sales Module**: Продажи и чеки
- **Promotions Module**: Акции и скидки
- **Reports Module**: Аналитика и отчеты

**Порты**:
- Development: 3000
- Production: 3000 (внутренний)

### 3. PostgreSQL

**Назначение**: Основная реляционная база данных

**Конфигурация**:
- Version: 16-alpine
- Encoding: UTF-8
- Extensions: uuid-ossp, pgcrypto

**Схема данных**:
```
alaroma (schema)
├── users (пользователи)
├── locations (склады и точки)
├── products (товары)
├── categories (категории)
├── inventory (остатки)
├── sales (продажи)
├── sale_items (позиции продаж)
├── promotions (акции)
├── gift_certificates (сертификаты)
├── inventory_movements (движения)
└── customers (клиенты)
```

**Оптимизации**:
- Connection pooling
- Индексы на часто запрашиваемых полях
- Партиционирование больших таблиц
- Регулярный VACUUM

**Порт**: 5432

### 4. Redis

**Назначение**: Кеширование и очереди

**Использование**:
- Кеширование запросов к БД
- Хранение сессий пользователей
- Rate limiting
- Очереди задач (Bull/BullMQ)
- Pub/Sub для real-time уведомлений

**Конфигурация**:
- MaxMemory: 256MB (dev) / 512MB (prod)
- Eviction policy: allkeys-lru
- Persistence: AOF + RDB

**Порт**: 6379

### 5. Nginx

**Назначение**: Reverse proxy и load balancer

**Функции**:
- Reverse proxy для backend и frontend
- SSL/TLS терминация
- Сжатие (gzip)
- Кеширование статических ресурсов
- Rate limiting
- Security headers

**Порты**:
- HTTP: 80
- HTTPS: 443

## Безопасность

### Аутентификация и авторизация

**JWT Strategy**:
- Access Token (короткий срок: 15 мин)
- Refresh Token (длинный срок: 7 дней)
- Хранение в httpOnly cookies

**RBAC (Role-Based Access Control)**:
```
admin -> Полный доступ
  ├── manager -> Управление складом
  ├── cashier -> Только продажи
  ├── salesperson -> Продажи + скидки
  └── warehouse_worker -> Складские операции
```

### Защита данных

- Шифрование паролей: bcrypt
- HTTPS для production
- Security headers (CSP, HSTS, etc.)
- SQL Injection protection (ORM)
- XSS protection
- CSRF protection

### Network Security

- Internal Docker network
- Минимальные открытые порты
- Rate limiting на API endpoints
- Connection limits

## Масштабируемость

### Horizontal Scaling

```
                 ┌─────────────┐
                 │   Nginx LB  │
                 └──────┬──────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
  ┌─────────┐    ┌─────────┐    ┌─────────┐
  │Backend 1│    │Backend 2│    │Backend N│
  └─────────┘    └─────────┘    └─────────┘
        │               │               │
        └───────────────┼───────────────┘
                        │
                        ▼
                ┌───────────────┐
                │   PostgreSQL  │
                │   (Primary)   │
                └───────┬───────┘
                        │
                ┌───────┴───────┐
                │               │
                ▼               ▼
        ┌─────────────┐ ┌─────────────┐
        │  Replica 1  │ │  Replica 2  │
        └─────────────┘ └─────────────┘
```

### Vertical Scaling

- Настройка ресурсов через Docker Compose
- Resource limits и reservations
- Database tuning parameters

### Caching Strategy

**Multi-Level Caching**:
1. Browser cache (static assets)
2. Nginx cache (responses)
3. Redis cache (data)
4. Database query cache

## Мониторинг и логирование

### Logging

**Структурированные логи (JSON)**:
```json
{
  "timestamp": "2024-01-01T12:00:00Z",
  "level": "info",
  "service": "backend",
  "message": "User logged in",
  "userId": "uuid",
  "ip": "192.168.1.1"
}
```

**Log Rotation**:
- Max size: 10MB
- Max files: 5
- Format: JSON

### Health Checks

Каждый сервис имеет health check endpoint:
- Backend: `/health`
- Frontend: `/`
- Nginx: `/health`
- PostgreSQL: `pg_isready`
- Redis: `PING`

### Metrics (будущее расширение)

- Prometheus для сбора метрик
- Grafana для визуализации
- AlertManager для уведомлений

## Backup & Recovery

### Backup Strategy

**Автоматические резервные копии**:
- Частота: Ежедневно в 2:00 AM
- Retention: 7 дней
- Хранение: Local + S3 (опционально)

**Компоненты backup**:
1. PostgreSQL dumps
2. Uploaded files
3. Redis snapshots (опционально)

### Recovery Process

1. Остановка сервисов
2. Восстановление БД из dump
3. Восстановление файлов
4. Валидация данных
5. Запуск сервисов

**RTO (Recovery Time Objective)**: < 1 час
**RPO (Recovery Point Objective)**: < 24 часа

## CI/CD Pipeline (рекомендации)

```
Developer Push
      │
      ▼
  Git Hook
      │
      ▼
  Lint & Test
      │
      ▼
  Build Images
      │
      ▼
  Push to Registry
      │
      ▼
  Deploy to Staging
      │
      ▼
  Integration Tests
      │
      ▼
  Deploy to Production
      │
      ▼
  Health Check
```

## Performance Optimization

### Database

- **Индексы**: На foreign keys и часто запрашиваемых полях
- **Connection Pooling**: Max 200 connections
- **Query Optimization**: Использование EXPLAIN ANALYZE
- **Partitioning**: Для больших таблиц (sales, movements)

### Backend

- **Caching**: Redis для frequently accessed data
- **Pagination**: Limit/offset для больших списков
- **Async Operations**: Для длительных задач
- **Database Queries**: N+1 query prevention

### Frontend

- **Code Splitting**: Автоматическое в Next.js
- **Image Optimization**: Next.js Image component
- **Static Generation**: Для статических страниц
- **CDN**: Для статических ресурсов (production)

### Network

- **HTTP/2**: Через Nginx
- **Compression**: Gzip для текстовых ресурсов
- **Connection Pooling**: Keep-alive connections
- **CDN**: CloudFlare / AWS CloudFront (production)

## Развертывание

### Development

```bash
make install  # Первоначальная настройка
make dev      # Запуск в dev режиме
```

### Production

```bash
# Настройка environment
cp .env.example .env.production
# Редактирование .env.production

# Запуск
docker-compose -f docker-compose.prod.yml up -d
```

### Docker Registry

Для production рекомендуется использовать private registry:
```bash
docker tag alaroma/backend:latest registry.company.com/alaroma/backend:v1.0.0
docker push registry.company.com/alaroma/backend:v1.0.0
```

## Troubleshooting

### Частые проблемы

1. **Database connection issues**
   - Проверить healthcheck
   - Проверить credentials в .env
   - Проверить network connectivity

2. **Out of memory**
   - Увеличить Docker memory limits
   - Настроить resource limits в compose

3. **Slow queries**
   - Анализ через pg_stat_statements
   - Добавление индексов
   - Query optimization

## Будущие улучшения

1. **Kubernetes deployment** для лучшей оркестрации
2. **Microservices** разделение на отдельные сервисы
3. **Event-driven architecture** с message broker (RabbitMQ/Kafka)
4. **Elasticsearch** для полнотекстового поиска
5. **Monitoring stack** (Prometheus + Grafana)
6. **CI/CD pipeline** автоматизация
7. **Multi-region deployment** для HA
8. **CDN integration** для статики
