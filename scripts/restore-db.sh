#!/bin/bash
# ==============================================================================
# DigiPort Universal Paid Media OS - Disaster Recovery Restore Script
# Restores compressed PostgreSQL snapshots into production database container
# ==============================================================================

set -euo pipefail

if [ "$#" -ne 1 ]; then
  echo "Usage: $0 <path_to_backup_file.sql.gz>" >&2
  exit 1
fi

BACKUP_FILE="$1"
CONTAINER_NAME="digiport-postgres"
DB_USER="postgres"
DB_NAME="digital_marketr"

if [ ! -f "${BACKUP_FILE}" ]; then
  echo "ERROR: Backup file not found at: ${BACKUP_FILE}" >&2
  exit 1
fi

echo "=================================================================="
echo "WARNING: This will overwrite data in [${DB_NAME}]!"
echo "Target Container: ${CONTAINER_NAME}"
echo "Source File:      ${BACKUP_FILE}"
echo "=================================================================="

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Restoring database snapshot..."
gunzip -c "${BACKUP_FILE}" | docker exec -i "${CONTAINER_NAME}" psql -U "${DB_USER}" -d "${DB_NAME}"

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Database restore finished successfully."
