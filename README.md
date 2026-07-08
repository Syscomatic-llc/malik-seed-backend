# malik-seed-backend

## Docker VPS deployment

Create a production `.env` from the example and change the passwords/secrets:

```bash
cp .env.example .env
nano .env
```

For Docker deployment, do not set `DATABASE_URL` to `localhost` or `127.0.0.1`.
The compose file builds the correct internal URL automatically:

```text
postgres:5432
```

Deploy or rebuild on the VPS:

```bash
docker compose down --remove-orphans
docker compose up -d --build --force-recreate
docker compose logs -f backend
```

The backend is exposed on host port `9000`, and the frontend is exposed on host
port `6500`.
