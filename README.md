# Plant Access Control

Plant Access Control is a visitor registration and access-tracking system for
industrial facilities. This repository contains a small full-stack Next.js
application for guard authentication, visitor registration and access history.

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
- `POSTGRES_USER`: local PostgreSQL user for host-run PostgreSQL commands.
- `POSTGRES_PASSWORD`: local PostgreSQL password for host-run PostgreSQL commands.
- `POSTGRES_DB`: local PostgreSQL database name for host-run PostgreSQL commands.
- `DATABASE_URL`: PostgreSQL connection string used by Prisma and the running
  application. Use the Neon pooled connection string for remote deployments or
  the Docker-local connection string for local PostgreSQL.
- `DIRECT_URL`: direct PostgreSQL connection string used by Prisma migrations
  and schema operations.
- `GUARD_PIN`: PIN entered by the guard to authenticate.
- `SESSION_SECRET`: long random secret used to sign and verify the guard
  session cookie.
- `SESSION_COOKIE_SECURE`: set to `false` for local HTTP Docker runs. Leave it
  unset or use a secure value in HTTPS production deployments.

For Neon or another managed PostgreSQL provider, use the two connection strings
from the provider dashboard:

- `DATABASE_URL`: Neon pooled connection string with connection pooling on.
- `DIRECT_URL`: Neon direct connection string with connection pooling off.

Keep real Neon values only in local or deployment environment variables. Never
commit `.env` or any real database credentials.

For Docker local PostgreSQL, the hostname depends on where the command runs:

- From the Docker app container, use `db`.
- From host-run Prisma commands, use `localhost`.

## Authentication

Guard authentication is intentionally simple. The guard submits a PIN, the
server compares it with `GUARD_PIN`, and a successful login sets a signed
HTTP-only session cookie. Sessions are verified with `SESSION_SECRET` and are
not stored in the database.

The session cookie uses `sameSite` protection, is marked secure in production,
and expires after a fixed session window.

The public login route is:

```text
/
```

The protected guard workspace route is:

```text
/workspace
```

Unauthenticated requests to `/workspace` redirect to `/`. After a successful
login, the browser enters `/workspace`; logging out clears the session cookie
and returns the user to the public login state.

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

Verify the browser flow locally:

1. Open `http://localhost:3000`.
2. Enter the configured `GUARD_PIN` from `.env`.
3. Confirm the browser lands on `http://localhost:3000/workspace`.
4. Click `Logout`.
5. Confirm visiting `http://localhost:3000/workspace` returns to the login
   page.

Verify the protected workspace route with curl:

```bash
curl -i http://localhost:3000/workspace

curl -i -c /tmp/plant-auth-cookie.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'

curl -i -b /tmp/plant-auth-cookie.txt http://localhost:3000/workspace

curl -i -b /tmp/plant-auth-cookie.txt -c /tmp/plant-auth-cookie.txt \
  -X POST http://localhost:3000/api/auth/logout

curl -i -b /tmp/plant-auth-cookie.txt http://localhost:3000/workspace
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

Successful registration persists the visitor and the initial access entry in a
single database transaction. If either write fails, the registration does not
leave a partial visitor record behind.

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

## Visitor Registration UI

The protected workspace includes the first visitor registration screen at:

```text
/workspace/visitors/new
```

Verify the browser flow locally against the configured database:

1. Start the configured database if it is local.
2. Start the app with `npm run dev`.
3. Open `http://localhost:3000`.
4. Log in with the configured `GUARD_PIN`.
5. From `/workspace`, click `Register visitor`.
6. Complete name, DNI, company and sector.
7. Capture a photo with the camera or upload an image file.
8. Submit the form and confirm the success state shows the registered visitor
   information.
9. Use `Register another visitor` to clear the form, or `Return to workspace`
   to go back to the guard workspace.

The UI submits the existing `POST /api/visitors` payload. Visitor photographs
are sent as `photoDataUrl` base64 data URLs and stored by the backend in
PostgreSQL for the challenge MVP.

## Docker

Run the Docker app with the database configured in `.env`:

```bash
docker compose up --build app
```

When `.env` contains Neon connection strings, the app container connects to
Neon. Prisma migrations should already be applied to that Neon database before
using the app.

The Docker image build does not read `.env`; `.dockerignore` keeps local
environment files out of the image build context. The runtime container receives
database credentials from Docker Compose `env_file`/environment variables.

To run the Docker app against the optional local PostgreSQL service, set
`DATABASE_URL` and `DIRECT_URL` in `.env` to the Docker service hostname:

```text
postgresql://postgres:postgres@db:5432/geno_challenge?schema=public
```

Then run:

```bash
docker compose up --build
```

This starts both the app and the `db` service. The `db` service remains
available for local PostgreSQL development, but the app is not hardcoded to use
it.

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

When running Prisma commands from the host machine against Docker local
PostgreSQL, use `localhost` in `.env`:

```text
postgresql://postgres:postgres@localhost:5432/geno_challenge?schema=public
```

Then run migrations or other Prisma commands:

```bash
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

The visitor registration backend uses whichever PostgreSQL database is
configured through `DATABASE_URL` and `DIRECT_URL`. Use placeholders in
documentation and logs; never print real Neon credentials.

## Verification

Run the project checks:

```bash
npm run lint
npm test
npx tsc --noEmit
npx prisma validate
npm run build
docker compose build app
```

Verify the database schema in Docker PostgreSQL:

```bash
docker compose exec db psql -U postgres -d geno_challenge -c '\d "Visitor"'
docker compose exec db psql -U postgres -d geno_challenge -c '\d "Entry"'
```

Verify the Docker app responds with the database configured in `.env`:

```bash
docker compose up --build app
curl http://localhost:3000
```

After creating a visitor, confirm persistence in the configured database without
printing secrets. For Docker PostgreSQL:

```bash
docker compose exec db psql -U postgres -d geno_challenge \
  -c 'select id, name, dni, company, sector, "qrToken", "createdAt" from "Visitor" order by "createdAt" desc limit 5;'

docker compose exec db psql -U postgres -d geno_challenge \
  -c 'select id, "visitorId", "createdAt" from "Entry" order by "createdAt" desc limit 5;'
```

For Neon, keep the real `DATABASE_URL` and `DIRECT_URL` in local or deployment
environment variables, start the application with those values, create a visitor
through the authenticated API flow above, and confirm the row through Prisma
Studio or the Neon SQL console without exposing credentials.
