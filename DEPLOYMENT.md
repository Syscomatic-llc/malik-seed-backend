# Deployment Guide — Malik Seeds CMS

This guide covers deploying the backend on a Linux VPS with **aaPanel** + **Nginx**, and using the demo seed data in production.

---

## 1. Server Preparation

- Linux VPS (Ubuntu 22.04/24.04 recommended)
- aaPanel installed
- Python 3.12+ installed on the server
- PostgreSQL or MySQL database created (PostgreSQL recommended)

---

## 2. Upload Project

Upload the project files to your server, e.g.:

```bash
/var/www/malik-seed-backend
```

---

## 3. Environment Configuration

Copy the example env file and edit it:

```bash
cd /var/www/malik-seed-backend
cp .env.example .env
nano .env
```

Example production `.env`:

```env
DATABASE_URL=postgresql+psycopg://malikseed_user:STRONG_PASSWORD@localhost:5432/malikseed_db
SECRET_KEY=your-super-secret-key-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=1440
UPLOAD_DIR=/var/www/malik-seed-backend/uploads
MAX_FILE_SIZE=10485760

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@malikseed.com
SMTP_PASSWORD=your-smtp-password
FROM_EMAIL=noreply@malikseed.com
ADMIN_EMAIL=admin@malikseed.com

FIRST_ADMIN_EMAIL=admin@malikseed.com
FIRST_ADMIN_PASSWORD=ChangeThisStrongPassword123
```

---

## 4. Install Python Dependencies

```bash
cd /var/www/malik-seed-backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

> Make sure `psycopg` or `psycopg2-binary` is in `requirements.txt` for PostgreSQL.

---

## 5. Run Migrations & Seed Demo Data

### If running directly on the server (venv)

```bash
cd /var/www/malik-seed-backend
source venv/bin/activate

# Add missing columns / resize columns (safe to run multiple times)
python migrate.py

# Seed demo data (skip if already seeded)
python seed_figma_data.py

# Force re-seed if you want fresh demo data (WARNING: clears existing data)
# python seed_figma_data.py --force
```

### If running with Docker Compose

Run migrations and seeding manually inside the running backend container:

```bash
# Add missing columns / resize columns (safe to run multiple times)
docker compose exec backend python migrate.py

# Seed demo data
docker compose exec backend python seed_figma_data.py

# Force re-seed (WARNING: clears existing data)
docker compose exec backend python seed_figma_data.py --force
```

---

## 6. Run Backend with Gunicorn / Uvicorn

Create a systemd service or use aaPanel's **Python Project Manager**.

### Option A: systemd service

Create `/etc/systemd/system/malikseed.service`:

```ini
[Unit]
Description=Malik Seed CMS API
After=network.target

[Service]
Type=simple
User=www
Group=www
WorkingDirectory=/var/www/malik-seed-backend
Environment="PATH=/var/www/malik-seed-backend/venv/bin"
EnvironmentFile=/var/www/malik-seed-backend/.env
ExecStart=/var/www/malik-seed-backend/venv/bin/gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000 --timeout 120
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Then:

```bash
sudo systemctl daemon-reload
sudo systemctl enable malikseed
sudo systemctl start malikseed
```

### Option B: aaPanel Python Project Manager

1. Go to **Websites** → **Python Project** → **Add Project**.
2. Project path: `/var/www/malik-seed-backend`
3. Startup command: `gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 127.0.0.1:8000`
4. Load `.env` file in the project settings.

---

## 7. Nginx Configuration (aaPanel)

Add a website in aaPanel pointing to your domain, e.g. `apimalikseed.syscomatic.cloud`.

Edit the nginx config for that site and replace the `location /` block with:

```nginx
server {
    listen 80;
    server_name apimalikseed.syscomatic.cloud;

    client_max_body_size 50M;

    # Serve uploaded media directly from disk (fixes HTTP/2 image errors)
    location /uploads/ {
        alias /var/www/malik-seed-backend/uploads/;
        expires 1y;
        add_header Cache-Control "public, max-age=31536000, immutable";
        add_header Access-Control-Allow-Origin *;
        try_files $uri $uri/ =404;
    }

    # Proxy everything else to FastAPI
    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_buffering off;
        proxy_request_buffering off;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
        proxy_send_timeout 120s;
    }
}
```

If you use HTTPS/SSL (recommended), aaPanel will add the SSL block. Make sure the same `location /uploads/` and proxy settings are inside the `server { listen 443 ssl http2; ... }` block too.

### Fixing `ERR_HTTP2_PROTOCOL_ERROR` on images

The error usually happens because Nginx proxies image requests through FastAPI with buffering. The config above fixes it by:

1. Serving `/uploads/` directly from disk (bypasses FastAPI).
2. Disabling `proxy_buffering` and `proxy_request_buffering`.
3. Adding explicit cache headers.

After changing nginx, reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. Build & Deploy Frontend

On your local machine or a build server:

```bash
cd atlantis-ng-21.0.0

# Install dependencies
npm install

# Build for production with your API URL
# Edit src/environments/environment.prod.ts first, or use docker build args
npm run build
```

Upload the contents of `atlantis-ng-21.0.0/dist/atlantis-ng/browser/` to your web root (e.g. `/var/www/malik-seed-frontend`).

If you serve the frontend from the same domain as the API, set:

```ts
// src/environments/environment.prod.ts
export const environment = {
    production: true,
    apiBaseUrl: '/api/v1',
    mediaBaseUrl: '/',
};
```

If the frontend is on a different subdomain, use the full URL:

```ts
apiBaseUrl: 'https://apimalikseed.syscomatic.cloud/api/v1',
mediaBaseUrl: 'https://apimalikseed.syscomatic.cloud/',
```

---

## 9. SSL (HTTPS)

In aaPanel:

1. Go to **Websites** → your site → **SSL**.
2. Apply for a free Let's Encrypt certificate.
3. Force HTTPS if desired.

---

## 10. Verify Deployment

```bash
# Health check
curl https://apimalikseed.syscomatic.cloud/health

# API docs
curl https://apimalikseed.syscomatic.cloud/docs

# Test image direct access (replace with a real uploaded filename)
curl -I https://apimalikseed.syscomatic.cloud/uploads/homepage/some_image.png
```

---

## 11. Updating After Code Changes

```bash
cd /var/www/malik-seed-backend
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
python migrate.py
sudo systemctl restart malikseed
```

Then rebuild and re-upload the frontend if you changed Angular code.

---

## 12. Troubleshooting

| Problem | Solution |
|---|---|
| Images fail with `ERR_HTTP2_PROTOCOL_ERROR` | Serve `/uploads/` directly via nginx; disable proxy buffering. |
| Database column errors | Run `python migrate.py`. |
| No demo data | Run `python seed_figma_data.py`. Use `--force` to reset. |
| Admin routes exposed | Add JWT dependency to `api/v1/endpoints/admin/routes.py` (future hardening). |
| CORS errors | Already configured `allow_origins=["*"]` in `main.py`. Restrict in production. |
