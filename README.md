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
  application. Use the Cloud SQL Unix socket connection string for Cloud Run
  production or the Docker-local connection string for local PostgreSQL.
- `DIRECT_URL`: direct PostgreSQL connection string used by Prisma CLI commands
  because `prisma/schema.prisma` defines `directUrl`. It is not required by the
  running Cloud Run app.
- `GUARD_PIN`: PIN entered by the guard to authenticate.
- `SESSION_SECRET`: long random secret used to sign and verify the guard
  session cookie.
- `SESSION_COOKIE_SECURE`: set to `false` for local HTTP Docker runs. Leave it
  unset or use a secure value in HTTPS production deployments.

Production on Google Cloud Run requires these environment variables:

- `DATABASE_URL`
- `GUARD_PIN`
- `SESSION_SECRET`
- `SESSION_COOKIE_SECURE` only when overriding the default secure-cookie
  behavior
- `NEXT_PUBLIC_APP_NAME` only when overriding the default public app name

Recommended Cloud SQL connection strategy:

1. Attach the Cloud SQL instance to the Cloud Run service.
2. Grant the Cloud Run service account the `roles/cloudsql.client` IAM role.
3. Configure `DATABASE_URL` with the Cloud SQL Unix socket form:

```text
postgresql://DB_USER:DB_PASSWORD@localhost/DB_NAME?host=/cloudsql/PROJECT:REGION:INSTANCE&schema=public
```

Keep real Google Cloud project IDs, instance names, database passwords and
service URLs only in deployment environment variables or secrets. Never commit
`.env` or any real database credentials.

Alternatives are possible but are not the default for this challenge:

- Public IP with SSL can work, but it exposes a public database connectivity
  surface.
- Private IP with a VPC connector provides stricter network isolation, but adds
  VPC setup that is not necessary for the simplest Cloud Run deployment.

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

Entry arrival timestamps are stored as database `DateTime` instants in
`Entry.arrivedAt`. Future UI and reporting surfaces should format those
timestamps for display using the IANA timezone
`America/Argentina/Buenos_Aires`; do not store formatted timestamp strings.

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
6. Confirm the registration screen includes a `Return to workspace` action.
7. Complete name, DNI, company and sector.
8. Capture a photo with the camera or upload an image file.
9. Submit the form and confirm the printable credential shows the registered
   visitor information, photo and QR code.
10. Open the browser print dialog and confirm the credential can be printed or
    saved as a PDF.
11. Use `Register another visitor` to clear the credential and return to a
    fresh form, or `Return to workspace` to go back to the guard workspace.

The UI submits the existing `POST /api/visitors` payload. Visitor photographs
are sent as `photoDataUrl` base64 data URLs and stored by the backend in
PostgreSQL for the challenge MVP. The credential preview retains the submitted
photo in browser state after the API returns the created visitor payload, then
renders a QR code from the server-generated `qrToken`.

## Visitor Search API

Authenticated guards can search for an existing visitor by DNI through:

```http
GET /api/visitors/search?dni=12%20345%20678
```

Visitor search accepts numeric DNI values with 7 or 8 digits. The server
removes whitespace before lookup, then rejects non-digit values or values
outside that length range. Visitor registration keeps its existing DNI
normalization behavior.

Successful search returns a small visitor summary:

```json
{
  "visitor": {
    "id": "visitor_id",
    "name": "Ada Lovelace",
    "dni": "12345678",
    "company": "Analytical Engines SA",
    "sector": "Operations",
    "createdAt": "2026-06-12T12:00:00.000Z"
  }
}
```

Search responses intentionally do not include `photoDataUrl` or `qrToken`.

Visitor detail is available through:

```http
GET /api/visitors/{visitorId}
```

Successful detail responses include the fields needed for identification,
entry history and credential rendering:

```json
{
  "visitor": {
    "id": "visitor_id",
    "name": "Ada Lovelace",
    "dni": "12345678",
    "company": "Analytical Engines SA",
    "sector": "Operations",
    "photoDataUrl": "data:image/png;base64,REPLACE_WITH_IMAGE_DATA",
    "qrToken": "server-generated-token",
    "createdAt": "2026-06-12T12:00:00.000Z",
    "entries": [
      {
        "id": "entry_id",
        "arrivedAt": "2026-06-12T12:00:00.000Z"
      }
    ]
  }
}
```

The detail response includes `qrToken` only so the UI can render the embedded QR
credential. Do not display it as plain text.

Expected results:

- Missing or invalid DNI returns `400`.
- Requests without a valid guard session return `401`.
- Missing visitors return `404`.
- Unexpected database errors return `500` with a generic error message.

With the application running, verify the endpoints with curl:

```bash
curl -i -c /tmp/plant-auth-cookie.txt -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin":"1234"}'

curl -i -b /tmp/plant-auth-cookie.txt \
  "http://localhost:3000/api/visitors/search?dni=12%20345%20678"

curl -i -b /tmp/plant-auth-cookie.txt \
  "http://localhost:3000/api/visitors/REPLACE_WITH_VISITOR_ID"
```

## Visitor Search UI

The protected workspace includes visitor lookup at:

```text
/workspace/visitors/search
```

Verify the browser flow locally against the configured database:

1. Start the configured database if it is local.
2. Start the app with `npm run dev`.
3. Open `http://localhost:3000`.
4. Log in with the configured `GUARD_PIN`.
5. From `/workspace`, click `Search visitor`.
6. Search by a 7 or 8 digit DNI and confirm a matching visitor opens at
   `/workspace/visitors/{visitorId}`.
7. Confirm the detail view shows visitor information, photo and entry history.
8. Confirm the detail view includes a `Back to search` action near the top.
9. Open the printable credential and confirm the QR code is embedded there.
10. Search for a missing DNI and confirm the not-found state links to visitor
   registration.

The search flow does not validate QR codes or create repeat entries. Those
actions remain separate future workflows.

## Docker

Run the Docker app with the database configured in `.env`:

```bash
docker compose up --build app
```

When `.env` contains Cloud SQL connection strings and the runtime environment
can reach Cloud SQL, the app container connects to Cloud SQL. For local Docker
Compose development, keep using the Docker-local PostgreSQL values shown below.
Prisma migrations should already be applied to the configured production
database before using the deployed app.

The Docker image build does not read `.env`; `.dockerignore` keeps local
environment files out of the image build context. The runtime container receives
database credentials from Docker Compose `env_file`/environment variables.
The production runner image intentionally does not include Prisma CLI for
startup migrations.

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

Production migration policy:

- Do not run migrations during Docker image build.
- Do not run migrations automatically on container startup.
- Run committed migrations manually or in CI/CD before deploying or releasing
  the Cloud Run revision.
- The production runner image intentionally does not include Prisma CLI for
  startup migrations.

To apply migrations to production, run this command from an environment that has
network access to the Cloud SQL instance and production `DATABASE_URL` set:

```bash
npx prisma migrate deploy
```

Only run this command when you intentionally want to apply committed migrations
to the configured production database. Because `prisma/schema.prisma` defines
`directUrl`, Prisma CLI commands also need `DIRECT_URL` set to a valid
PostgreSQL connection string. The running Cloud Run app only needs
`DATABASE_URL`.

Do not create a migration unless `prisma/schema.prisma` changed.

The visitor registration backend uses whichever PostgreSQL database is
configured through `DATABASE_URL`. Use placeholders in documentation and logs;
never print real Google Cloud or database credentials.

## Verification

Run the project checks:

```bash
npm run lint
npm test
npx tsc --noEmit
npx prisma validate
DATABASE_URL="postgresql://prisma:prisma@localhost:5432/prisma?schema=public" DIRECT_URL="postgresql://prisma:prisma@localhost:5432/prisma?schema=public" npm run prisma:generate
npm run build
docker compose build app
docker compose config
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
  -c 'select id, "visitorId", "arrivedAt" from "Entry" order by "arrivedAt" desc limit 5;'
```

For Cloud SQL, keep the real `DATABASE_URL` and any Prisma CLI-only
`DIRECT_URL` in local, CI/CD or deployment environment variables. Start the
application with those values, create a visitor through the authenticated API
flow above, and confirm the row through Cloud SQL Studio, `psql`, or Prisma
Studio without exposing credentials.
