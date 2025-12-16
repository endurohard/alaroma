#!/bin/bash

# Al Aroma Restore Script
# Восстановление базы данных и загруженных файлов из резервной копии

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backup file is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Backup file not specified${NC}"
    echo "Usage: $0 <backup_file.sql.gz>"
    echo ""
    echo "Available backups:"
    ls -lh /backups/postgres/*.sql.gz 2>/dev/null || echo "No backups found"
    exit 1
fi

BACKUP_FILE="$1"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Error: Backup file not found: $BACKUP_FILE${NC}"
    exit 1
fi

# Database configuration
DB_HOST=${POSTGRES_HOST:-postgres}
DB_PORT=${POSTGRES_PORT:-5432}
DB_NAME=${POSTGRES_DB:-alaroma}
DB_USER=${POSTGRES_USER:-alaroma_user}

echo -e "${YELLOW}⚠ WARNING: This will restore the database from backup${NC}"
echo -e "${YELLOW}   Current database data will be LOST!${NC}"
echo -e "${YELLOW}   Backup file: $BACKUP_FILE${NC}"
echo ""
read -p "Are you sure you want to continue? (yes/no): " -r
echo

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo -e "${GREEN}Restore cancelled${NC}"
    exit 0
fi

echo -e "${GREEN}Starting restore process at $(date)${NC}"

# Extract if compressed
if [[ "$BACKUP_FILE" == *.gz ]]; then
    echo -e "${YELLOW}Decompressing backup...${NC}"
    TEMP_FILE="/tmp/restore_$(date +%s).sql"
    gunzip -c "$BACKUP_FILE" > "$TEMP_FILE"
    RESTORE_FILE="$TEMP_FILE"
else
    RESTORE_FILE="$BACKUP_FILE"
fi

# Drop and recreate database
echo -e "${YELLOW}Recreating database...${NC}"
PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres <<EOF
DROP DATABASE IF EXISTS $DB_NAME;
CREATE DATABASE $DB_NAME;
EOF

# Restore database
echo -e "${YELLOW}Restoring database from backup...${NC}"
if PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" < "$RESTORE_FILE"; then
    echo -e "${GREEN}✓ Database restored successfully${NC}"
else
    echo -e "${RED}✗ Database restore failed${NC}"
    exit 1
fi

# Clean up temporary file
if [ -n "$TEMP_FILE" ] && [ -f "$TEMP_FILE" ]; then
    rm "$TEMP_FILE"
fi

echo -e "\n${GREEN}Restore process completed successfully at $(date)${NC}"

exit 0
