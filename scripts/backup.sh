#!/bin/bash

# Al Aroma Backup Script
# Автоматическое резервное копирование базы данных и загруженных файлов

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="/backups"
POSTGRES_DIR="$BACKUP_DIR/postgres"
UPLOADS_DIR="$BACKUP_DIR/uploads"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-7}

# Database configuration
DB_HOST=${POSTGRES_HOST:-postgres}
DB_PORT=${POSTGRES_PORT:-5432}
DB_NAME=${POSTGRES_DB:-alaroma}
DB_USER=${POSTGRES_USER:-alaroma_user}

echo -e "${GREEN}Starting backup process at $(date)${NC}"

# Create backup directories if they don't exist
mkdir -p "$POSTGRES_DIR"
mkdir -p "$UPLOADS_DIR"

# Backup PostgreSQL database
echo -e "${YELLOW}Backing up PostgreSQL database...${NC}"
POSTGRES_BACKUP_FILE="$POSTGRES_DIR/alaroma_${DATE}.sql"

if PGPASSWORD="$POSTGRES_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" > "$POSTGRES_BACKUP_FILE"; then
    echo -e "${GREEN}✓ Database backup completed: $POSTGRES_BACKUP_FILE${NC}"

    # Compress the backup
    gzip "$POSTGRES_BACKUP_FILE"
    echo -e "${GREEN}✓ Backup compressed: ${POSTGRES_BACKUP_FILE}.gz${NC}"
else
    echo -e "${RED}✗ Database backup failed${NC}"
    exit 1
fi

# Backup uploads directory
echo -e "${YELLOW}Backing up uploads...${NC}"
UPLOADS_BACKUP_FILE="$UPLOADS_DIR/uploads_${DATE}.tar.gz"

if [ -d "/app/uploads" ]; then
    if tar -czf "$UPLOADS_BACKUP_FILE" -C /app uploads; then
        echo -e "${GREEN}✓ Uploads backup completed: $UPLOADS_BACKUP_FILE${NC}"
    else
        echo -e "${RED}✗ Uploads backup failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Uploads directory not found, skipping...${NC}"
fi

# Remove old backups (keep last N days)
echo -e "${YELLOW}Cleaning up old backups (keeping last ${RETENTION_DAYS} days)...${NC}"

# Remove old database backups
if [ -n "$(find "$POSTGRES_DIR" -name "*.sql.gz" -type f -mtime +${RETENTION_DAYS})" ]; then
    find "$POSTGRES_DIR" -name "*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete
    echo -e "${GREEN}✓ Old database backups removed${NC}"
fi

# Remove old uploads backups
if [ -n "$(find "$UPLOADS_DIR" -name "*.tar.gz" -type f -mtime +${RETENTION_DAYS})" ]; then
    find "$UPLOADS_DIR" -name "*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete
    echo -e "${GREEN}✓ Old uploads backups removed${NC}"
fi

# Show backup statistics
echo -e "\n${GREEN}=== Backup Statistics ===${NC}"
echo -e "Database backups: $(ls -1 "$POSTGRES_DIR" | wc -l)"
echo -e "Uploads backups: $(ls -1 "$UPLOADS_DIR" | wc -l)"
echo -e "Total size: $(du -sh "$BACKUP_DIR" | cut -f1)"

echo -e "\n${GREEN}Backup process completed successfully at $(date)${NC}"

exit 0
