# Architecture Document 10: Deployment Architecture
## Production Infrastructure, Docker Topology & Environment Deployment

**Version:** 2.0.0  
**Phase:** 1 (Enterprise Architecture Deliverable)  
**Standard:** Enterprise Multi-Container Docker Topology with Direct Platform Secrets

---

### 1. Production Docker Topology Diagram

```mermaid
graph TD
    INTERNET((Public Web & Webhooks)) --> CLOUDFLARE[Cloudflare Edge SSL / DDoS Proxy]
    CLOUDFLARE --> TRAEFIK[Traefik v3 Reverse Proxy & Router]
    
    subgraph "Internal Isolated Docker Network: digiport-net"
        TRAEFIK --> APP[DigiPort Web Application :3000]
        TRAEFIK --> OPENCLAW[OpenClaw Gateway Container :18789]
        APP <--> OPENCLAW
        APP <--> PG[(PostgreSQL 16 :5432)]
        APP <--> REDIS[(Redis 7.2 Cache & Queue :6379)]
    end

    APP --> GOOGLE_API[(Google Ads Official API)]
    APP --> META_API[(Meta Graph API)]
    APP --> TIKTOK_API[(TikTok Business API)]
    APP --> TELEGRAM_API[(Telegram Bot API)]
```

---

### 2. Production Docker Compose (`docker-compose.prod.yml`)

```yaml
version: '3.9'

networks:
  digiport-net:
    driver: bridge

volumes:
  pgdata:
  redisdata:
  openclawdata:

services:
  digiport-app:
    image: digiport-os:latest
    build:
      context: .
      dockerfile: Dockerfile
    container_name: digiport-core-app
    restart: always
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:${PG_PASSWORD}@postgres:5432/digital_marketr?schema=public
      - REDIS_URL=redis://redis:6379
      - ENCRYPTION_SECRET=${ENCRYPTION_SECRET}
      - JWT_SECRET=${JWT_SECRET}
      - OPENCLAW_BASE_URL=http://openclaw:18789
      - OPENCLAW_GATEWAY_TOKEN=${OPENCLAW_GATEWAY_TOKEN}
      - TELEGRAM_BOT_TOKEN=${TELEGRAM_BOT_TOKEN}
      - TELEGRAM_CHAT_ID=${TELEGRAM_CHAT_ID}
      - META_ACCESS_TOKEN=${META_ACCESS_TOKEN}
      - META_AD_ACCOUNT_ID=${META_AD_ACCOUNT_ID}
      - META_PIXEL_ID=${META_PIXEL_ID}
      - GOOGLE_ADS_DEVELOPER_TOKEN=${GOOGLE_ADS_DEVELOPER_TOKEN}
      - GOOGLE_ADS_CLIENT_ID=${GOOGLE_ADS_CLIENT_ID}
      - GOOGLE_ADS_CLIENT_SECRET=${GOOGLE_ADS_CLIENT_SECRET}
      - GOOGLE_ADS_REFRESH_TOKEN=${GOOGLE_ADS_REFRESH_TOKEN}
      - GOOGLE_ADS_CUSTOMER_ID=${GOOGLE_ADS_CUSTOMER_ID}
      - TIKTOK_ACCESS_TOKEN=${TIKTOK_ACCESS_TOKEN}
      - TIKTOK_ADVERTISER_ID=${TIKTOK_ADVERTISER_ID}
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      openclaw:
        condition: service_started
    networks:
      - digiport-net
    ports:
      - "3000:3000"

  openclaw:
    image: openclaw/gateway:latest
    container_name: openclaw-agent-gateway
    restart: always
    volumes:
      - openclawdata:/root/.openclaw
    environment:
      - OPENROUTER_API_KEY=${OPENROUTER_API_KEY}
    networks:
      - digiport-net
    ports:
      - "18789:18789"

  postgres:
    image: postgres:16-alpine
    container_name: digiport-postgres
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${PG_PASSWORD}
      POSTGRES_DB: digital_marketr
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - digiport-net

  redis:
    image: redis:7.2-alpine
    container_name: digiport-redis
    restart: always
    volumes:
      - redisdata:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - digiport-net
```

---

### 3. Health Checks & Probes

* **Liveness Probe:** `GET /api/platforms/ai/test` returns `HTTP 200` if core web server is up.
* **Readiness Probe:** `GET /api/ai/chat` verifies OpenClaw / AI gateway connectivity.
* **Platform Probe:** `POST /api/platforms/{google|meta|tiktok}/test` verifies direct credential validity without impacting live campaigns.
