# Plant Access Control

Plant Access Control is a visitor registration and access-tracking system for
industrial facilities. This repository contains the initial Next.js foundation
for the application.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Prisma
- Docker
- PostgreSQL

## Local Setup

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Environment

Create a local environment file from the example:

```bash
cp .env.example .env
```

Variables introduced by the scaffold:

- `NODE_ENV`: runtime environment.
- `NEXT_PUBLIC_APP_NAME`: public application name.
- `POSTGRES_USER`: local PostgreSQL user.
- `POSTGRES_PASSWORD`: local PostgreSQL password.
- `POSTGRES_DB`: local PostgreSQL database name.
- `DATABASE_URL`: PostgreSQL connection string used by Prisma. The example
  uses the Docker Compose service host `db`.
- `GUARD_PIN`: PIN entered by the guard to authenticate.
- `SESSION_SECRET`: long random secret used to sign and verify the guard
  session cookie.

## Authentication

Guard authentication is intentionally simple. The guard submits a PIN, the
server compares it with `GUARD_PIN`, and a successful login sets a signed
HTTP-only session cookie. Sessions are verified with `SESSION_SECRET` and are
not stored in the database.

The session cookie uses `sameSite` protection, is marked secure in production,
and expires after a fixed session window.

With the development server running, verify the endpoints with curl:

```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin":"wrong"}'

curl -i -c /tmp/plant-auth-cookie.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'

curl -i -b /tmp/plant-auth-cookie.txt http://localhost:3000/api/auth/session

curl -i -b /tmp/plant-auth-cookie.txt -c /tmp/plant-auth-cookie.txt \
  -X POST http://localhost:3000/api/auth/logout

curl -i -b /tmp/plant-auth-cookie.txt http://localhost:3000/api/auth/session
```

## Docker

Run the application and PostgreSQL locally:

```bash
docker compose up --build
```

Stop the containers:

```bash
docker compose down
```

## Prisma

Application code should import the shared Prisma Client from
`src/lib/prisma.ts`. The helper reuses a single client during development hot
reloads and creates a normal client in production.

Start only PostgreSQL for local Prisma commands:

```bash
docker compose up -d db
```

The `.env.example` `DATABASE_URL` uses `db` because it is read from inside
Docker Compose containers. When running Prisma from the host machine, override
the host to `localhost`:

```bash
DATABASE_URL="postgresql://plant_access:plant_access_password@localhost:5432/plant_access_control?schema=public" \
  npm run prisma:migrate -- --name add_visitors_entries
```

Validate the schema, generate the Prisma client and open Prisma Studio:

```bash
npm run prisma:validate
npm run prisma:generate
npm run prisma:studio
```

Do not create a migration unless `prisma/schema.prisma` changed.

## Verification

Run the project checks:

```bash
npm run lint
npm run build
```

Verify the database schema in Docker PostgreSQL:

```bash
docker compose exec db psql -U plant_access -d plant_access_control -c '\d "Visitor"'
docker compose exec db psql -U plant_access -d plant_access_control -c '\d "Entry"'
```

Verify the Docker app responds:

```bash
curl http://localhost:3000
```
