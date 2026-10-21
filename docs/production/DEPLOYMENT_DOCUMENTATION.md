# Production Deployment & Operations Guide

**System:** DigiPort Universal Paid Media OS  
**Architecture:** Linux VPS, Docker Compose, Traefik v3 Reverse Proxy  
**Standard:** Enterprise Production Operations Manual  

---

## 1. Prerequisites & Server Sizing

- **Operating System:** Ubuntu 22.04 LTS or Debian 12 (x86_64).
- **Minimum Hardware Specifications:**
  - 4 vCPUs
  - 8 GB RAM
  - 50 GB NVMe SSD Storage
- **Required Host Software:**
  - Docker Engine v24.0+
  - Docker Compose v2.20+
  - Git & cURL

---

## 2. Step-by-Step Production Deployment

### Step 1: Clone Repository
```bash
sudo mkdir -p /var/www
cd /var/www
git clone https://github.com/jahedofficial/Digi-port.git
cd Digi-port
```

### Step 2: Configure Production Environment Variables
Copy `.env.example` to `.env.local` and populate production credentials:
```bash
cp .env.example .env.local
chmod 600 .env.local
nano .env.local
```

Ensure the following critical variables are populated:
```ini
NODE_ENV=production
PORT=3000
DOMAIN_NAME=marketing.yourdomain.com
ACME_EMAIL=admin@yourdomain.com

# Cryptography & Auth (Must be 32+ characters)
ENCRYPTION_SECRET=your_32_character_minimum_random_secret_here!
JWT_SECRET=your_strong_jwt_secret_key_minimum_16_chars

# Database & Cache
PG_PASSWORD=strong_postgres_password_here
DATABASE_URL=postgresql://postgres:${PG_PASSWORD}@postgres:5432/digital_marketr?schema=public
REDIS_URL=redis://redis:6379

# Direct Platform Credentials
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
GOOGLE_ADS_CUSTOMER_ID=...

META_ACCESS_TOKEN=...
META_AD_ACCOUNT_ID=...

TIKTOK_ACCESS_TOKEN=...
TIKTOK_ADVERTISER_ID=...
```

### Step 3: Launch Multi-Container Production Stack
```bash
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml build digiport-app
docker compose -f docker-compose.prod.yml up -d
```

### Step 4: Verify Container Health Probes
```bash
docker compose -f docker-compose.prod.yml ps
```
All containers (`digiport-core-app`, `digiport-postgres`, `digiport-redis`, `digiport-traefik-proxy`, `openclaw-agent-gateway`) must show `healthy` status.

---

## 3. Database Snapshots & Automated Backup

A cron job runs the backup script daily at 02:00 UTC:
```bash
# Add to crontab (crontab -e)
0 2 * * * /var/www/Digi-port/scripts/backup-db.sh >> /var/log/digiport-backup.log 2>&1
```

### Disaster Recovery: Restoring from a Snapshot
```bash
chmod +x scripts/restore-db.sh
./scripts/restore-db.sh /var/backups/digiport/digiport_digital_marketr_20261021_020000.sql.gz
```

---

## 4. Zero-Downtime Rolling Updates

When new versions are pushed to `main`, GitHub Actions automatically triggers deployment, or run manually:
```bash
git pull origin main
docker compose -f docker-compose.prod.yml build --no-cache digiport-app
docker compose -f docker-compose.prod.yml up -d --no-deps digiport-app
```
