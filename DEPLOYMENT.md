# Al Aroma - Руководство по развертыванию

## Оглавление

1. [Локальная разработка](#локальная-разработка)
2. [Staging окружение](#staging-окружение)
3. [Production окружение](#production-окружение)
4. [Cloud провайдеры](#cloud-провайдеры)
5. [Kubernetes](#kubernetes)
6. [Мониторинг](#мониторинг)

---

## Локальная разработка

### Требования

- Docker 24.0+
- Docker Compose 2.20+
- 4GB RAM (минимум)
- 10GB свободного места

### Быстрый старт

```bash
# Клонирование
git clone <repository-url>
cd alaroma

# Настройка
cp .env.example .env
# Отредактируйте .env

# Запуск
docker-compose up -d

# Проверка
curl http://localhost/health
```

### Остановка

```bash
docker-compose down
```

---

## Staging окружение

### Настройка

```bash
# Создать staging .env
cp .env.example .env.staging

# Отредактировать для staging
nano .env.staging
```

**Важные параметры для staging**:
```bash
NODE_ENV=staging
BUILD_TARGET=production
POSTGRES_PASSWORD=<strong-password>
REDIS_PASSWORD=<strong-password>
JWT_SECRET=<random-32-chars>
```

### Запуск

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.staging up -d
```

---

## Production окружение

### Предварительные требования

- VPS/Dedicated Server (минимум 4GB RAM, 2 CPU cores)
- Domain name
- SSL certificate (Let's Encrypt рекомендуется)
- Backup система
- Monitoring система

### Подготовка сервера

#### Ubuntu/Debian

```bash
# Обновление системы
sudo apt update && sudo apt upgrade -y

# Установка Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Добавление пользователя в группу docker
sudo usermod -aG docker $USER

# Установка Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Настройка firewall
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Клонирование и настройка

```bash
# Клонирование проекта
cd /opt
sudo git clone <repository-url> alaroma
cd alaroma

# Создание production .env
cp .env.example .env.production
```

### Настройка .env.production

**КРИТИЧНО**: Измените все следующие параметры!

```bash
# General
NODE_ENV=production
BUILD_TARGET=production

# Database
POSTGRES_PASSWORD=<ОЧЕНЬ_СИЛЬНЫЙ_ПАРОЛЬ>

# Redis
REDIS_PASSWORD=<ОЧЕНЬ_СИЛЬНЫЙ_ПАРОЛЬ>

# JWT
JWT_SECRET=<СЛУЧАЙНАЯ_СТРОКА_МИНИМУМ_64_СИМВОЛА>
JWT_REFRESH_SECRET=<ДРУГАЯ_СЛУЧАЙНАЯ_СТРОКА>

# API URL
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# PgAdmin (опционально, рекомендуется отключить)
PGADMIN_EMAIL=admin@yourdomain.com
PGADMIN_PASSWORD=<СИЛЬНЫЙ_ПАРОЛЬ>
```

**Генерация сильных паролей**:
```bash
openssl rand -base64 64
```

### SSL сертификаты

#### Вариант 1: Let's Encrypt (рекомендуется)

```bash
# Установка certbot
sudo apt install certbot

# Получение сертификата
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Копирование в проект
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem docker/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem docker/nginx/ssl/key.pem

# Настройка автообновления
sudo crontab -e
# Добавить: 0 0 * * 0 certbot renew --quiet
```

#### Вариант 2: Самоподписанный сертификат (только для тестов!)

```bash
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout docker/nginx/ssl/key.pem \
  -out docker/nginx/ssl/cert.pem
```

### Раскомментирование HTTPS в nginx

Отредактируйте `docker/nginx/conf.d/default.conf` и раскомментируйте секцию HTTPS server.

### Запуск production

```bash
# Сборка и запуск
docker-compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# Проверка логов
docker-compose -f docker-compose.prod.yml logs -f

# Проверка статуса
docker-compose -f docker-compose.prod.yml ps
```

### Проверка работоспособности

```bash
# Health checks
curl https://yourdomain.com/health
curl https://yourdomain.com/api/health

# Просмотр логов
docker-compose -f docker-compose.prod.yml logs backend
```

### Настройка автозапуска

```bash
# Создать systemd service
sudo nano /etc/systemd/system/alaroma.service
```

Содержимое файла:
```ini
[Unit]
Description=Al Aroma Trading System
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/alaroma
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml --env-file .env.production up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
User=root

[Install]
WantedBy=multi-user.target
```

Активация:
```bash
sudo systemctl daemon-reload
sudo systemctl enable alaroma
sudo systemctl start alaroma
```

---

## Cloud провайдеры

### AWS EC2

#### 1. Создание инстанса

- AMI: Ubuntu 22.04 LTS
- Instance type: t3.medium (минимум)
- Storage: 30GB SSD
- Security Group:
  - SSH (22) - ваш IP
  - HTTP (80) - 0.0.0.0/0
  - HTTPS (443) - 0.0.0.0/0

#### 2. Elastic IP

Назначьте Elastic IP для статического адреса.

#### 3. RDS PostgreSQL (опционально)

Для production рекомендуется managed database:
```bash
# Измените DATABASE_URL в .env
DATABASE_URL=postgresql://user:pass@rds-endpoint:5432/alaroma
```

#### 4. ElastiCache Redis (опционально)

```bash
# Измените REDIS_URL в .env
REDIS_URL=redis://:password@elasticache-endpoint:6379
```

### DigitalOcean Droplet

#### 1. Создание Droplet

- Image: Ubuntu 22.04
- Plan: Basic $24/month (4GB RAM)
- Datacenter: ближайший к пользователям
- Add block storage: 50GB

#### 2. DNS настройка

- Добавьте A record: yourdomain.com → Droplet IP
- Добавьте A record: www.yourdomain.com → Droplet IP

#### 3. Managed Database (опционально)

DigitalOcean предлагает managed PostgreSQL и Redis.

### Google Cloud Platform

#### 1. Compute Engine

```bash
gcloud compute instances create alaroma-prod \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --tags=http-server,https-server
```

#### 2. Cloud SQL (PostgreSQL)

Создайте Cloud SQL instance для managed database.

#### 3. Memorystore (Redis)

Создайте Memorystore instance для managed cache.

---

## Kubernetes

### Helm Chart (пример)

Создайте `helm/alaroma/values.yaml`:

```yaml
replicaCount: 2

image:
  backend:
    repository: your-registry/alaroma-backend
    tag: latest
  frontend:
    repository: your-registry/alaroma-frontend
    tag: latest

service:
  type: LoadBalancer
  port: 80

ingress:
  enabled: true
  hosts:
    - host: yourdomain.com
      paths:
        - /
  tls:
    - secretName: alaroma-tls
      hosts:
        - yourdomain.com

postgresql:
  enabled: true
  auth:
    password: changeme
  primary:
    persistence:
      size: 20Gi

redis:
  enabled: true
  auth:
    password: changeme
```

### Развертывание в Kubernetes

```bash
# Создание namespace
kubectl create namespace alaroma

# Установка через Helm
helm install alaroma ./helm/alaroma -n alaroma

# Проверка
kubectl get pods -n alaroma
kubectl get svc -n alaroma
```

---

## Резервное копирование

### Автоматическое резервное копирование

#### Cron job

```bash
sudo crontab -e
```

Добавить:
```bash
# Ежедневный backup в 2 AM
0 2 * * * cd /opt/alaroma && docker-compose -f docker-compose.prod.yml run --rm backup

# Очистка старых бекапов (старше 30 дней)
0 3 * * 0 find /opt/alaroma/backups -type f -mtime +30 -delete
```

### Backup в S3

```bash
# Установка AWS CLI
sudo apt install awscli

# Настройка credentials
aws configure

# Скрипт синхронизации
cat > /opt/alaroma/scripts/sync-to-s3.sh << 'EOF'
#!/bin/bash
aws s3 sync /opt/alaroma/backups s3://your-bucket/alaroma-backups/ \
  --delete \
  --exclude "*" \
  --include "*.sql.gz" \
  --include "*.tar.gz"
EOF

chmod +x /opt/alaroma/scripts/sync-to-s3.sh

# Добавить в cron
0 4 * * * /opt/alaroma/scripts/sync-to-s3.sh
```

---

## Мониторинг

### Prometheus + Grafana (Docker Compose)

Создайте `docker-compose.monitoring.yml`:

```yaml
version: '3.9'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana:latest
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3002:3000"
    environment:
      GF_SECURITY_ADMIN_PASSWORD: changeme

  node-exporter:
    image: prom/node-exporter:latest
    ports:
      - "9100:9100"

volumes:
  prometheus_data:
  grafana_data:
```

Запуск:
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```

### Uptime monitoring

Используйте сервисы:
- UptimeRobot (бесплатно для 50 мониторов)
- Pingdom
- StatusCake

### Логирование

#### ELK Stack (опционально)

Для централизованного логирования можно добавить:
- Elasticsearch
- Logstash
- Kibana

#### CloudWatch (AWS)

```bash
# Установка CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb
```

---

## Обновление production

### Zero-downtime deployment

```bash
# 1. Создать новые образы
docker-compose -f docker-compose.prod.yml build

# 2. Запустить новые контейнеры
docker-compose -f docker-compose.prod.yml up -d --no-deps --build backend frontend

# 3. Проверить health
curl https://yourdomain.com/health

# 4. Если OK - старые контейнеры автоматически удалятся
# Если проблемы - откатиться:
docker-compose -f docker-compose.prod.yml up -d --no-deps --force-recreate backend frontend
```

### Blue-Green deployment

1. Создайте новый инстанс с обновленной версией
2. Переключите DNS на новый инстанс
3. Держите старый инстанс для отката

---

## Безопасность Production

### Чек-лист безопасности

- [ ] Все пароли изменены
- [ ] JWT секреты - случайные строки
- [ ] SSL сертификаты настроены
- [ ] Firewall настроен
- [ ] SSH ключи вместо паролей
- [ ] Автоматические обновления безопасности
- [ ] Регулярные бэкапы
- [ ] Monitoring настроен
- [ ] Логирование включено
- [ ] Rate limiting активен
- [ ] CORS правильно настроен
- [ ] Database - только внутренняя сеть
- [ ] Redis - только внутренняя сеть
- [ ] Secrets не в git репозитории

### Hardening сервера

```bash
# Отключить root SSH
sudo nano /etc/ssh/sshd_config
# PermitRootLogin no

# Настроить fail2ban
sudo apt install fail2ban
sudo systemctl enable fail2ban

# Автоматические обновления безопасности
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

---

## Rollback процедура

Если что-то пошло не так:

```bash
# 1. Остановить текущую версию
docker-compose -f docker-compose.prod.yml down

# 2. Восстановить из backup
./scripts/restore.sh /backups/postgres/backup_YYYYMMDD_HHMMSS.sql.gz

# 3. Откатиться на предыдущий образ
docker-compose -f docker-compose.prod.yml pull
git checkout <previous-commit>
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Проверить
curl https://yourdomain.com/health
```

---

## Поддержка

При проблемах с deployment:

1. Проверьте логи: `docker-compose logs`
2. Проверьте ресурсы: `docker stats`
3. Проверьте конфигурацию: `.env` файлы
4. Проверьте сеть: `docker network inspect`
5. Обратитесь к документации или создайте issue

---

**Успешного развертывания! 🚀**
