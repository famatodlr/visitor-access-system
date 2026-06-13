FROM node:22-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma Client generation needs syntactically valid PostgreSQL URLs for the
# schema env vars, but it does not connect to the database during image build.
RUN DATABASE_URL="postgresql://prisma:prisma@localhost:5432/prisma?schema=public" DIRECT_URL="postgresql://prisma:prisma@localhost:5432/prisma?schema=public" npm run prisma:generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

COPY package.json package-lock.json ./
COPY --from=builder /app/.next/standalone ./.next/standalone
COPY --from=builder /app/.next/static ./.next/standalone/.next/static

EXPOSE 3000

CMD ["npm", "run", "start"]
