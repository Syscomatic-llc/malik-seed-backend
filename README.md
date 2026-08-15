# Malik Seeds CMS — Docker VPS Deployment

> Complete server-side technical requirements and Docker-based deployment guide for the Malik Seeds CMS (Backend API + Admin Panel + PostgreSQL Database).

---

## Table of Contents

1. [Server Requirements](#1-server-requirements)
2. [Required Software](#2-required-software)
3. [Environment Configuration](#3-environment-configuration)
4. [Deployment Steps](#4-deployment-steps)
5. [Nginx Reverse Proxy](#5-nginx-reverse-proxy)
6. [SSL / TLS](#6-ssl--tls)
7. [Database & Migrations](#7-database--migrations)
8. [Backup & Cron Jobs](#8-backup--cron-jobs)
9. [Troubleshooting](#9-troubleshooting)
10. [Quick Commands](#10-quick-commands)

---

## 1. Server Requirements

| Resource | Minimum | Recommended |
|---|---|---|
| **OS** | Ubuntu 22.04/24.04 LTS, Debian 11/12, CentOS/RHEL 8/9 | Ubuntu 24.04 LTS |
| **CPU** | 1 vCPU | 2 vCPUs |
| **RAM** | 2 GB | 4 GB |
| **Storage** | 20 GB SSD | 40 GB SSD |
| **Docker** | 24.0+ | Latest stable |
| **Docker Compose** | 2.20+ | Latest stable |

---

## 2. Required Software

Install Docker and basic utilities on the host server:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install utilities
sudo apt install -y git curl wget nano ufw fail2ban

# Install Docker Engine
curl -fsSL https://get.docker.com | sh

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify
docker --version
docker compose version
```

### Docker Images Used

| Image | Version | Purpose |
|---|---|---|
| `postgres` | `17` | Database server |
| `python` | `3.12-slim` | Backend API runtime |
| `nginx` | `alpine` | Frontend static file server |

---

## 3. Environment Configuration

Create the production `.env` file:

```bash
cp .env.example .env
nano .env
```

### Required Variables

```env
# PostgreSQL
POSTGRES_DB=malikseed
POSTGRES_USER=malikseed
POSTGRES_PASSWORD=YourStrongPasswordHere

# JWT
SECRET_KEY=YourSuperSecretKeyMin32CharactersLong
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Uploads
MAX_FILE_SIZE=52428800

# CORS — comma-separated allowed domains
CORS_ORIGINS=https://cms.yourdomain.com,https://api.yourdomain.com

# SMTP
SMTP_HOST=smtp.yourserver.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=YourSmtpPassword
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# First Admin Account
FIRST_ADMIN_EMAIL=admin@yourdomain.com
FIRST_ADMIN_PASSWORD=YourStrongAdminPassword

# Frontend Build Args
API_BASE_URL=https://api.yourdomain.com/api/v1
MEDIA_BASE_URL=https://api.yourdomain.com/
```

> ⚠️ **Change ALL default passwords before production deployment.**

---

## 4. Deployment Steps

### 4.1 Upload Source Code

```bash
cd /var/www
git clone <repository-url> malik-seed-backend
cd malik-seed-backend
```

### 4.2 Build & Start

```bash
# First deployment
docker compose up -d --build --force-recreate

# View logs
docker compose logs -f
```

### 4.3 Verify

```bash
# Check containers
docker compose ps

# Test health endpoint
curl http://localhost:9000/health

# Test API docs
curl http://localhost:9000/docs
```

### 4.4 Ports Exposed

| Service | Host Port | Container Port | Access |
|---|---|---|---|
| Backend API | `9000` | `8000` | Internal / Nginx |
| CMS Frontend | `6500` | `80` | Internal / Nginx |
| PostgreSQL | — | `5432` | Internal only (not exposed) |

---

## 5. Nginx Reverse Proxy

Production requires Nginx (1.18+) as a reverse proxy with SSL termination.

Example config (`/etc/nginx/sites-available/malikseed`):

```nginx
# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    client_max_body_size 50M;

    # Serve uploads directly (fixes image errors)
    location /uploads/ {
        alias /var/www/malik-seed-backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header Access-Control-Allow-Origin *;
        try_files $uri $uri/ =404;
    }

    # Proxy to FastAPI backend
    location / {
        proxy_pass http://127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_read_timeout 120s;
    }
}

# CMS Admin Frontend
server {
    listen 80;
    server_name cms.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name cms.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:6500;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable:

```bash
sudo ln -s /etc/nginx/sites-available/malikseed /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. SSL / TLS

| Requirement | Details |
|---|---|
| Certificate | Let's Encrypt (free) or commercial |
| Protocol | TLS 1.2+ |
| Implementation | Nginx reverse proxy |
| Domains | `api.yourdomain.com` + `cms.yourdomain.com` |

Let's Encrypt with Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com -d cms.yourdomain.com
```

---

## 7. Database & Migrations

Migrations run **automatically** on backend startup.

Manual commands:

```bash
# Run migrations
docker compose exec backend python migrate.py

# Seed demo data
docker compose exec backend python seed_figma_data.py

# Access database
docker exec -it malikseed-postgres psql -U malikseed -d malikseed
```

Database dump (for backups or migration):

```bash
# Schema only
docker exec malikseed-postgres pg_dump -U malikseed -d malikseed --schema-only > schema.sql

# Full backup
docker exec malikseed-postgres pg_dump -U malikseed -d malikseed | gzip > backup.sql.gz
```

---

## 8. Backup & Cron Jobs

### Recommended Cron Schedule

```bash
sudo crontab -e
```

```cron
# Daily database backup at 2:00 AM
0 2 * * * docker exec malikseed-postgres pg_dump -U malikseed malikseed | gzip > /backups/db_$(date +\%Y\%m\%d).sql.gz

# Daily uploads backup at 2:30 AM
30 2 * * * tar -czf /backups/uploads_$(date +\%Y\%m\%d).tar.gz -C /var/www/malik-seed-backend uploads/

# Weekly cleanup of old backups (keep 7 days)
0 3 * * 0 find /backups -name "*.gz" -mtime +7 -delete

# Weekly Docker cleanup
0 4 * * 0 docker system prune -f
```

---

## 9. Troubleshooting

| Issue | Solution |
|---|---|
| Postgres fails to start | Check `.env` credentials match; reset volume with `docker compose down -v` for fresh install |
| CORS errors | Update `CORS_ORIGINS` in `.env` with exact frontend domain |
| Images not loading | Serve `/uploads/` directly via Nginx; do not proxy through backend |
| Container unhealthy | Check logs: `docker compose logs -f [service]` |
| SSL issues | Verify certificate paths and renewal |

### Reset Everything (⚠️ Deletes all data)

```bash
docker compose down -v --remove-orphans
docker compose up -d --build --force-recreate
```

---

## 10. Quick Commands

```bash
# Start
docker compose up -d

# Stop
docker compose down

# Rebuild
docker compose up -d --build --force-recreate

# Logs
docker compose logs -f
docker compose logs -f backend

# Execute in backend
docker compose exec backend python migrate.py

# Database shell
docker exec -it malikseed-postgres psql -U malikseed -d malikseed
```

---

> **Document Version:** 2.0  
> **Last Updated:** 2026-08-15  
> **Note:** Both backend API and CMS admin frontend are fully Dockerized. No host-level Python/Node.js installation required.
