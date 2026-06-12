# Plant Access Control

Plant Access Control is a visitor registration and access-tracking system for
industrial facilities. This repository contains the initial Next.js foundation
for the application.

## Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
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
- `DATABASE_URL`: PostgreSQL connection string for later Prisma setup.
- `GUARD_PIN`: guard PIN for the later authentication flow.
- `SESSION_SECRET`: secret for the later session cookie flow.

## Docker

Run the application and PostgreSQL locally:

```bash
docker compose up --build
```

Stop the containers:

```bash
docker compose down
```

## Verification

Run the project checks:

```bash
npm run lint
npm run build
```

Verify the Docker app responds:

```bash
curl http://localhost:3000
```
