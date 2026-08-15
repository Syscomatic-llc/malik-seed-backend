# Server Deployment Guide — Docker Compose

> **For:** IT Operations / DevOps Team  
> **Scope:** Complete server-side technical requirements and Docker-based deployment instructions for the Malik Seeds CMS (Backend API + Admin Panel + PostgreSQL Database).

---

## 1. Supported Operating System (OS)

| OS | Version | Notes |
|---|---|---|
| **Ubuntu** | 22.04 LTS / 24.04 LTS | Recommended |
| **Debian** | 11 / 12 | Fully supported |
| **CentOS / RHEL** | 8 / 9 | Supported with Docker CE |
| **AlmaLinux / Rocky Linux** | 8 / 9 | Compatible |

> The application is deployed via Docker containers, so any Linux distribution capable of running Docker Engine 24.0+ is acceptable.

---

## 2. Required Software Packages & Dependencies

### 2.1 Server-Level Prerequisites

Install the following on the host server **before** deployment:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install required utilities
sudo apt install -y git curl wget nano ufw fail2ban

# Install Docker Engine (official method)
curl -fsSL https://get.docker.com | sh

# Add current user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Verify installations
docker --version       # Expected: 24.0+
docker compose version # Expected: 2.20+
```

### 2.2 Docker Images Used (Auto-pulled on first build)

| Image | Version | Purpose |
|---|---|---|
| `postgres` | `17` | PostgreSQL database server |
| `python` | `3.12-slim` | Backend API runtime (FastAPI + Uvicorn) |
| `nginx` | `alpine` (via frontend Dockerfile) | Static file serving for CMS Admin Panel |

---

## 3. Web Server Requirements

| Option | Recommendation |
|---|---|
| **Primary (Recommended)** | **Nginx** (reverse proxy + SSL termination) — any stable version (1.18+) |
| Alternative | Apache 2.4+ with `mod_proxy` |

The Docker Compose stack exposes:
- **Backend API** on host port `9000`
- **Frontend (CMS Admin)** on host port `6500`

Production setup should place **Nginx** in front as a reverse proxy to handle:
- Domain routing (`api.yourdomain.com`, `cms.yourdomain.com`)
- SSL/TLS termination (Let's Encrypt or commercial certificate)
- Static asset caching
- Rate limiting and security headers

---

## 4. Database Server & Version

| Component | Version |
|---|---|
| **PostgreSQL** | **17** |
| Python Driver | `psycopg` 3.3.4 |

- Data is persisted in a named Docker volume: `malikseed-postgres17-data`
- The backend connects internally via Docker network (no exposed DB port required in production)
- Automatic healthchecks ensure the backend waits for the DB to be ready before starting

---

## 5. Required Services & Background Processes

The `docker-compose.yml` defines 3 services:

| Service | Container Name | Restart Policy | Description |
|---|---|---|---|
| `postgres` | `malikseed-postgres` | `unless-stopped` | PostgreSQL database |
| `backend` | `malik-seed-backend` | `unless-stopped` | FastAPI backend API |
| `frontend` | `malik-seed-frontend` | `unless-stopped` | Angular CMS Admin Panel (served via Nginx) |

All services include Docker healthchecks for automatic recovery monitoring.

---

## 6. Required System Libraries & Runtime Environments

All runtime dependencies are **containerized** — the host server only needs Docker.  
The backend image (`python:3.12-slim`) includes:

- Python 3.12
- GCC compiler (for building Python packages)
- `libpq-dev` (PostgreSQL client libraries)
- Uvicorn ASGI server
- FastAPI framework

No host-level Python installation is required.

---

## 7. File & Directory Permission Requirements

```
/var/www/malik-seed-backend/   (or your chosen deployment path)
├── .env                       # 600 (owner read/write only)
├── docker-compose.yml         # 644
├── Dockerfile                 # 644
├── uploads/                   # 755 (mounted into backend container)
└── ...
```

- The `uploads/` directory is bind-mounted into the backend container at `/app/uploads`
- Ensure the directory is writable by the Docker process
- Do **not** commit `.env` to version control

---

## 8. Storage, Memory & CPU Recommendations

| Resource | Minimum | Recommended |
|---|---|---|
| **CPU** | 1 vCPU | 2 vCPUs |
| **RAM** | 2 GB | 4 GB |
| **Storage** | 20 GB SSD | 40 GB SSD |
| **Network** | Stable internet | Low-latency preferred |

Additional storage may be required depending on uploaded media files (images, documents, etc.) stored in the `uploads/` directory.

---

## 9. SSL / TLS Requirements

| Requirement | Details |
|---|---|
| **Certificate** | Let's Encrypt (free) or commercial SSL certificate |
| **Protocol** | TLS 1.2 or higher |
| **Implementation** | Nginx reverse proxy handles SSL termination |
| **Domains** | API domain + CMS Admin domain (2 subdomains minimum) |

Example domains:
- `https://api.malikseeds.com` → Backend API
- `https://cms.malikseeds.com` → CMS Admin Panel

---

## 10. Required Scheduled Tasks (Cron Jobs)

| Task | Frequency | Command / Purpose |
|---|---|---|
| **Docker container health check** | Every 5 min | `docker compose ps` — monitor via external monitoring (optional) |
| **SSL certificate renewal** | Auto (Certbot) | `certbot renew` — if using Let's Encrypt with Nginx |
| **Database backup** | Daily at 2:00 AM | `docker exec malikseed-postgres pg_dump -U malikseed malikseed > /backups/malikseed_$(date +\%Y\%m\%d).sql` |
| **Uploads backup** | Daily at 2:30 AM | `rsync -avz /var/www/malik-seed-backend/uploads/ /backups/uploads/` |
| **Log rotation** | Weekly | `docker system prune -f` — clean unused images/containers (optional) |

Sample cron setup:

```bash
# Edit crontab
sudo crontab -e

# Add these lines
0 2 * * * docker exec malikseed-postgres pg_dump -U malikseed malikseed > /backups/malikseed_$(date +\%Y\%m\%d).sql
30 2 * * * rsync -avz /var/www/malik-seed-backend/uploads/ /backups/uploads/
0 3 * * 0 docker system prune -f
```

---

## 11. Environment Configuration

Create a production `.env` file before first deployment:

```bash
cp .env.example .env
nano .env
```

### Required Environment Variables

```env
# PostgreSQL (used by both postgres service and backend)
POSTGRES_DB=malikseed
POSTGRES_USER=malikseed
POSTGRES_PASSWORD=YourStrongPasswordHere

# JWT Security
SECRET_KEY=YourSuperSecretKeyMin32CharactersLong
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# File Uploads
MAX_FILE_SIZE=52428800

# CORS — comma-separated list of allowed frontend domains
CORS_ORIGINS=https://cms.yourdomain.com,https://api.yourdomain.com

# SMTP (for email notifications)
SMTP_HOST=smtp.yourserver.com
SMTP_PORT=587
SMTP_USER=noreply@yourdomain.com
SMTP_PASSWORD=YourSmtpPassword
FROM_EMAIL=noreply@yourdomain.com
ADMIN_EMAIL=admin@yourdomain.com

# First Admin Account (created on first run)
FIRST_ADMIN_EMAIL=admin@yourdomain.com
FIRST_ADMIN_PASSWORD=YourStrongAdminPassword

# Frontend Build Args (used during docker build)
API_BASE_URL=https://api.yourdomain.com/api/v1
MEDIA_BASE_URL=https://api.yourdomain.com/
```

> ⚠️ **Security:** Change ALL default passwords before production deployment.

---

## 12. Deployment Steps

### Step 1 — Clone / Upload Source Code

```bash
cd /var/www
git clone <repository-url> malik-seed-backend
cd malik-seed-backend
```

### Step 2 — Configure Environment

```bash
cp .env.example .env
nano .env  # Edit all values
```

### Step 3 — Build & Start Services

```bash
# First time / fresh deployment
docker compose up -d --build --force-recreate

# View logs
docker compose logs -f
```

### Step 4 — Verify Services

```bash
# Check all containers are running
docker compose ps

# Test backend health
curl http://localhost:9000/health

# Test API docs
curl http://localhost:9000/docs
```

### Step 5 — Configure Nginx Reverse Proxy

Create `/etc/nginx/sites-available/malikseed`:

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

    location /uploads/ {
        alias /var/www/malik-seed-backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header Access-Control-Allow-Origin *;
        try_files $uri $uri/ =404;
    }

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

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/malikseed /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 13. Database Schema & Migrations

Database migrations run **automatically** when the backend container starts.  
To run manually:

```bash
# Apply migrations
docker compose exec backend python migrate.py

# Seed demo data (optional)
docker compose exec backend python seed_figma_data.py
```

To export the database schema for the IT team:

```bash
# Full database dump
docker exec malikseed-postgres pg_dump -U malikseed -d malikseed --schema-only > schema.sql

# Full data dump
docker exec malikseed-postgres pg_dump -U malikseed -d malikseed > full_backup.sql
```

---

## 14. Backup & Recovery

### Backup Script (`/opt/scripts/backup-malikseed.sh`)

```bash
#!/bin/bash
BACKUP_DIR="/backups/malikseed"
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# Database backup
docker exec malikseed-postgres pg_dump -U malikseed malikseed | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Uploads backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /var/www/malik-seed-backend uploads/

# Keep only last 7 days
find $BACKUP_DIR -name "*.gz" -mtime +7 -delete
```

Make executable: `chmod +x /opt/scripts/backup-malikseed.sh`

---

## 15. Troubleshooting

| Issue | Solution |
|---|---|
| Postgres fails to start | Check volume credentials match `.env`; reset with `docker compose down -v` if fresh install |
| Backend shows CORS errors | Update `CORS_ORIGINS` in `.env` to include your exact frontend domain |
| Images not loading | Ensure Nginx serves `/uploads/` directly; do not proxy through backend |
| Container unhealthy | Check logs: `docker compose logs -f [service]` |
| SSL certificate issues | Verify Certbot renewal or certificate paths in Nginx config |

---

## 16. Quick Reference Commands

```bash
# Start all services
docker compose up -d

# Stop all services
docker compose down

# Restart with rebuild
docker compose up -d --build --force-recreate

# View logs
docker compose logs -f
docker compose logs -f backend

# Execute command in backend container
docker compose exec backend python migrate.py

# Access database directly
docker exec -it malikseed-postgres psql -U malikseed -d malikseed

# Reset everything (WARNING: deletes all data)
docker compose down -v --remove-orphans
```

---

## 17. Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   End Users     │     │   CMS Admins    │     │   IT Team       │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Nginx Reverse Proxy                       │
│  (SSL Termination, Static Caching, Rate Limiting)                │
└─────────────────────────────────────────────────────────────────┘
         │                       │
         ▼                       ▼
┌─────────────────┐     ┌─────────────────┐
│  api.domain.com │     │  cms.domain.com │
│  Port 9000      │     │  Port 6500      │
│                 │     │                 │
│  FastAPI        │     │  Angular +      │
│  (Python 3.12)  │◄────│  Nginx Alpine   │
│                 │     │                 │
└────────┬────────┘     └─────────────────┘
         │
         ▼
┌─────────────────┐
│  PostgreSQL 17  │
│  Port 5432      │
│  (Internal)     │
└─────────────────┘
```

---

> **Document Version:** 1.0  
> **Last Updated:** 2026-08-15  
> **Contact:** For deployment support, refer to the project repository or contact the development team.
