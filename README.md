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
- `DIRECT_URL`: direct PostgreSQL connection string used by Prisma migrations
  and schema operations. The local example matches `DATABASE_URL`.
- `GUARD_PIN`: PIN entered by the guard to authenticate.
- `SESSION_SECRET`: long random secret used to sign and verify the guard
  session cookie.

For Neon, use the two connection strings from the Neon project dashboard:

- `DATABASE_URL`: Neon pooled connection string with connection pooling on.
- `DIRECT_URL`: Neon direct connection string with connection pooling off.

Keep real Neon values only in local or deployment environment variables. Never
commit `.env` or any real database credentials.

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

## Visitor Registration API

Visitor registration is available to authenticated guards through:

```http
POST /api/visitors
```

Request body:

```json
{
  "name": "Ada Lovelace",
  "dni": "12 345 678",
  "company": "Analytical Engines SA",
  "sector": "Operations",
  "photoDataUrl": "data:image/png;base64,REPLACE_WITH_IMAGE_DATA"
}
```

Required fields:

- `name`
- `dni`
- `company`
- `sector`
- `photoDataUrl`

All string fields are trimmed by the server. DNI is normalized before it is
stored, and the QR token is generated server-side. `photoDataUrl` is stored
directly in PostgreSQL for the challenge MVP; object storage and QR image
generation are intentionally out of scope.

With the application running, verify the endpoint with curl:

```bash
curl -i -c /tmp/plant-auth-cookie.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'

curl -i -b /tmp/plant-auth-cookie.txt -X POST http://localhost:3000/api/visitors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ada Lovelace",
    "dni": "12 345 678",
    "company": "Analytical Engines SA",
    "sector": "Operations",
    "photoDataUrl": "data:image/png;base64,REPLACE_WITH_IMAGE_DATA"
  }'

curl -i -b /tmp/plant-auth-cookie.txt -X POST http://localhost:3000/api/visitors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Ada Lovelace",
    "dni": "12345678",
    "company": "Analytical Engines SA",
    "sector": "Operations",
    "photoDataUrl": "data:image/png;base64,REPLACE_WITH_IMAGE_DATA"
  }'

curl -i -b /tmp/plant-auth-cookie.txt -X POST http://localhost:3000/api/visitors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Missing Sector",
    "dni": "99 999 999",
    "company": "Example Company",
    "photoDataUrl": "data:image/png;base64,REPLACE_WITH_IMAGE_DATA"
  }'

curl -i -X POST http://localhost:3000/api/visitors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Unauthenticated Visitor",
    "dni": "88 888 888",
    "company": "Example Company",
    "sector": "Operations",
    "photoDataUrl": "data:image/png;base64,REPLACE_WITH_IMAGE_DATA"
  }'
```

Expected results:

- Authenticated create returns `201` with `id`, `name`, `dni`, `company`,
  `sector`, `qrToken` and `createdAt`.
- Reusing the same normalized DNI returns `409`.
- Missing required fields return `400`.
- Requests without a valid guard session return `401`.

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

The `.env.example` `DATABASE_URL` and `DIRECT_URL` use `db` because they are
read from inside Docker Compose containers. When running Prisma from the host
machine, override the host to `localhost`:

```bash
DATABASE_URL="postgresql://plant_access:plant_access_password@localhost:5432/plant_access_control?schema=public" \
DIRECT_URL="postgresql://plant_access:plant_access_password@localhost:5432/plant_access_control?schema=public" \
  npm run prisma:migrate -- --name add_visitors_entries
```

Validate the schema, generate the Prisma client and open Prisma Studio:

```bash
npm run prisma:validate
npm run prisma:generate
npm run prisma:studio
```

To verify migrations against Neon, first configure local `.env` with the real
Neon pooled `DATABASE_URL` and direct `DIRECT_URL`, then run:

```bash
npx prisma migrate deploy
```

Only run this command when you intentionally want to apply committed migrations
to the configured Neon database.

Do not create a migration unless `prisma/schema.prisma` changed.

The visitor registration backend has been designed to work with the same
`DATABASE_URL` and `DIRECT_URL` setup used for Docker PostgreSQL and Neon
PostgreSQL. Use placeholders in documentation and logs; never print real Neon
credentials.

## Verification

Run the project checks:

```bash
npm run lint
npx tsc --noEmit
npm run build
docker compose build app
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

After creating a visitor, confirm persistence in the configured database without
printing secrets. For Docker PostgreSQL:

```bash
docker compose exec db psql -U plant_access -d plant_access_control \
  -c 'select id, name, dni, company, sector, "qrToken", "createdAt" from "Visitor" order by "createdAt" desc limit 5;'
```

For Neon, keep the real `DATABASE_URL` and `DIRECT_URL` in local or deployment
environment variables, start the application with those values, create a visitor
through the authenticated API flow above, and confirm the row through Prisma
Studio or the Neon SQL console without exposing credentials.
