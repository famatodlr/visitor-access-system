# Visitor Access System

Visitor Access System is a focused access-control application for industrial
facilities. It helps security guards register visitors, issue printable QR
credentials and track repeat entries without relying on paper logs.

The project is intentionally small and production-minded: a full-stack
TypeScript app with protected workflows, PostgreSQL persistence and a
Dockerized runtime suitable for deployment.

## Overview

Industrial sites need a fast, reliable way to identify visitors and keep a
traceable record of who entered the facility. This system digitizes the guard
desk workflow while keeping the interface simple enough for repeated daily use.

The application is built for a security guard operating from a desktop or
laptop. The guard signs in with a PIN, registers visitors, captures a webcam
photo, prints a QR credential and later validates that QR credential to record
future entries.

## Problem

Paper-based visitor logs are slow to fill out, hard to search and weak for
auditability. A guard must repeatedly write visitor identity, company,
destination sector and entry time by hand. Returning visitors also require
manual lookup or re-entry, which increases friction and the chance of mistakes.

Industrial environments need a lean workflow that can:

- identify each visitor clearly;
- prevent duplicate visitor records by DNI;
- generate a reusable credential;
- record repeat entries quickly;
- preserve access history for later review.

## Solution

Visitor Access System replaces the paper log with a protected operational
workspace. Guards can register a visitor once, capture the visitor photo through
the webcam, generate a printable credential with a QR code and search existing
visitors by DNI.

For repeat visits, the guard scans the QR credential. The backend validates the
stored QR token, finds the visitor and records a new immutable entry timestamp.
Visitor detail pages show identity data, the credential and the entry history
with the newest entries first.

## Main Features

- Guard authentication with a signed HTTP-only session cookie
- Protected workspace and protected API endpoints
- Visitor registration with required name, DNI, company, sector and webcam photo
- Duplicate DNI handling
- Printable visitor credential with photo and QR code
- DNI-based visitor search
- Visitor detail page with credential and access history
- QR validation for repeat entries
- Immutable entry records for traceability
- Dockerized production runtime

## Product Flow

1. The guard signs in with the configured guard PIN.
2. The guard registers a visitor with identity, company and sector details.
3. The guard captures the visitor photo using the webcam.
4. The system creates the visitor, records the initial entry and generates a QR
   credential.
5. The guard prints or saves the visitor credential.
6. The guard can search existing visitors by DNI and open their detail page.
7. On future visits, the guard scans the QR credential.
8. The system validates the QR token and records a new entry for that visitor.

## Technical Highlights

- Next.js App Router with Route Handlers
- React and TypeScript throughout the UI and backend code
- Prisma Client with PostgreSQL persistence
- Lightweight layered flow: UI -> API route -> service -> repository -> Prisma
- Signed guard session cookie using a server-side `SESSION_SECRET`
- QR token generation and validation for repeat entries
- Base64 photo storage in PostgreSQL for challenge-scope simplicity
- Docker multi-stage image with Next.js standalone output
- Production-oriented migration policy: run Prisma migrations before deploy, not
  during image build or container startup

## Production / Deployment Notes

The app is prepared to run as a containerized Next.js service connected to a
managed PostgreSQL database. For Google Cloud Run, the intended production
shape is:

- deploy the Docker image as the application container;
- connect it to a managed PostgreSQL database such as Cloud SQL;
- provide `DATABASE_URL`, `GUARD_PIN` and `SESSION_SECRET` through environment
  variables or secrets;
- apply committed Prisma migrations from CI/CD or an operator machine before
  deploying the new revision.

The Docker image does not bake in environment files or credentials. Prisma
Client is generated during image build with placeholder PostgreSQL URLs, while
runtime database access is controlled by environment variables.

## Future Improvements

- More granular user roles beyond the single guard PIN
- Advanced administration screens for managing visitors
- CSV or PDF report exports for access history
- QR expiration or rotation policies
- Integration with badge printers or physical credential hardware
- External object storage for visitor photos
- More complete audit logs for authentication and operational events

## Local Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

At minimum, configure:

```text
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/geno_challenge?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/geno_challenge?schema=public"
GUARD_PIN="1234"
SESSION_SECRET="replace-with-a-long-random-secret"
SESSION_COOKIE_SECURE="false"
```

Start PostgreSQL through Docker Compose:

```bash
docker compose up -d db
```

Apply migrations from the host:

```bash
npm run prisma:migrate -- --name add_visitors_entries
```

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`, sign in with `GUARD_PIN` and use the protected
workspace at `/workspace`.

## Docker

For a local Docker app run against the Compose PostgreSQL service, set
`DATABASE_URL` and `DIRECT_URL` in `.env` to the Docker service hostname:

```text
postgresql://postgres:postgres@db:5432/geno_challenge?schema=public
```

Then run:

```bash
docker compose up --build
```

The app is exposed at `http://localhost:3000`. Stop the containers with:

```bash
docker compose down
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string used by the running application
  and Prisma Client.
- `DIRECT_URL`: direct PostgreSQL connection string required by Prisma CLI
  commands because the schema defines `directUrl`.
- `GUARD_PIN`: PIN used by the guard to sign in.
- `SESSION_SECRET`: long random secret used to sign and verify session cookies.
- `SESSION_COOKIE_SECURE`: set to `false` for local HTTP Docker runs; leave
  secure behavior enabled for HTTPS production deployments.
- `NEXT_PUBLIC_APP_NAME`: optional public application name override.
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`: local Compose database
  settings.

Never commit real secrets, database passwords or cloud resource identifiers.

## Verification

Run the project checks:

```bash
npm run lint
npm test
npx tsc --noEmit
npm run prisma:validate
env DATABASE_URL="postgresql://prisma:prisma@localhost:5432/prisma?schema=public" DIRECT_URL="postgresql://prisma:prisma@localhost:5432/prisma?schema=public" GUARD_PIN="1234" SESSION_SECRET="local-test-session-secret-with-enough-length" npm run build
docker compose config
docker compose build app
```

## API Summary

All visitor APIs require a valid guard session.

- `POST /api/auth/login`: authenticate with `{ "pin": "..." }`.
- `POST /api/auth/logout`: clear the guard session cookie.
- `GET /api/auth/session`: return whether the guard is authenticated.
- `POST /api/visitors`: register a visitor and initial entry.
- `GET /api/visitors/search?dni=12345678`: search by numeric DNI.
- `GET /api/visitors/{visitorId}`: load visitor detail, photo, credential data
  and entry history.
- `POST /api/visitors/qr/validate`: validate a QR token and record a repeat
  entry.

Visitor registration stores the webcam photo as a base64 data URL in
PostgreSQL. Search responses intentionally omit the photo and QR token; the
detail response includes them only for identification and credential rendering.
