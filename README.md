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
malikseed-postgres:5432
```

Deploy or rebuild on the VPS:

```bash
docker compose down --remove-orphans
docker compose up -d --build --force-recreate
docker compose logs -f backend
```

If Postgres is unhealthy after changing `POSTGRES_DB`, `POSTGRES_USER`, or
`POSTGRES_PASSWORD`, the existing Docker volume was probably initialized with
older credentials. For a fresh deployment where you do not need old database
data, reset it:

```bash
docker compose down -v --remove-orphans
docker compose up -d --build --force-recreate
docker compose logs -f postgres backend
```

Do not downgrade the Postgres image after a volume has been created. A volume
initialized by Postgres 17 must keep using `postgres:17` unless you dump and
restore the database into another version.

The backend is exposed on host port `9000`, and the frontend is exposed on host
port `6500`.
