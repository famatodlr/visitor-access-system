AGENTS.md

This repository contains Plant Access Control, a web application for visitor registration, credential generation and access tracking in industrial environments.

The application is intentionally small and focused. The goal is not to demonstrate every possible architectural pattern, but to deliver a clean, production-minded solution that satisfies the requirements with high quality.

Before implementing any change, read:

1. PRODUCT.md
2. DESIGN.md

These documents are the source of truth for product behavior, architecture decisions, visual language and interaction patterns.

⸻

Repository

Plant Access Control is a full-stack TypeScript application.

src/
├── app/          # Next.js pages and API routes
├── components/   # Reusable UI components
├── server/       # Services, repositories, auth and business logic
├── domain/       # Domain types and entities
└── lib/          # Shared utilities
prisma/
├── schema.prisma
└── migrations/
PRODUCT.md
DESIGN.md

The application uses:

* Next.js
* React
* TypeScript
* Prisma
* PostgreSQL
* Docker

Keep the architecture simple.

⸻

Before implementing anything

Always follow this process:

1. Read PRODUCT.md.
2. Read DESIGN.md.
3. Inspect the existing implementation.
4. Identify existing patterns.
5. Extend existing patterns whenever possible.
6. Only then implement changes.

Do not introduce new patterns without a clear reason.

⸻

Architecture Rules

The project follows a lightweight layered architecture.

Preferred flow:

UI
 ↓
API Route
 ↓
Service
 ↓
Repository
 ↓
Prisma
 ↓
Database

UI

Components and pages are responsible for:

* rendering;
* user interaction;
* form state;
* calling APIs.

UI should not contain business logic.

⸻

API Routes

API routes are thin.

Responsibilities:

* validate input;
* call services;
* return responses.

Business rules do not belong here.

⸻

Services

Services contain business logic.

Examples:

* register visitor;
* generate credential;
* validate QR;
* register entry;
* search visitor by DNI.

Services orchestrate repositories.

⸻

Repositories

Repositories are responsible for persistence.

Examples:

* create visitor;
* find visitor by DNI;
* find visitor by QR token;
* create entry record.

Repositories communicate with Prisma.

Repositories do not contain business decisions.

⸻

Prisma

Prisma is the persistence layer.

* Prisma manages database access.
* Prisma migrations manage schema evolution.
* Prisma is not a service and does not run as a separate process.

⸻

Simplicity First

This is a challenge project.

Do not introduce:

* microservices;
* event buses;
* message queues;
* CQRS;
* complex authentication systems;
* unnecessary abstractions;
* enterprise patterns without clear value.

Prefer the simplest solution that satisfies the requirements.

⸻

TypeScript

Use TypeScript everywhere.

Avoid:

any

unless there is no reasonable alternative.

Prefer explicit types and interfaces.

⸻

Error Handling

Handle expected failures gracefully.

Examples:

* duplicate DNI;
* invalid QR token;
* visitor not found;
* camera access denied;
* database connection errors.

Never silently ignore errors.

⸻

Docker

The application must remain containerized.

Requirements:

* Dockerfile must stay functional.
* Environment variables must remain configurable.
* The application must run locally through Docker.
* The application must be deployable through a container image.

Do not introduce machine-specific assumptions.

⸻

Git Rules

Never perform git operations unless explicitly requested.

Do not:

* create commits;
* amend commits;
* squash commits;
* rebase;
* push;
* merge;
* delete branches.

without user approval.

You may prepare changes and suggest commits.

⸻

Commit Philosophy

When asked to create commits:

* one logical change per commit;
* small and incremental commits;
* descriptive commit messages.

Examples:

feat: implement visitor registration flow
feat: persist visitor photos
feat: generate qr credentials
feat: add visitor search by dni
feat: implement guard authentication
chore: add docker deployment setup
docs: update project documentation

The commit history should clearly explain how the project was built.

⸻

Security

Never commit:

* secrets;
* passwords;
* API keys;
* database credentials;
* production environment variables.

Use environment variables.

⸻

Documentation

Keep documentation aligned with the implementation.

When architecture, setup or behavior changes:

* update documentation;
* update examples when necessary;
* keep onboarding instructions accurate.

⸻

Decision Making

When multiple solutions exist:

1. Prefer simplicity.
2. Prefer maintainability.
3. Prefer consistency.
4. Prefer solutions that can be explained easily in an interview.

The objective is to build a clean, deployable and production-minded application, not the most sophisticated system possible.

⸻

Git Workflow and Commit Discipline

Work in small, atomic, defensible commits. Each commit should represent one coherent step in the implementation and should be easy to explain during a review.

Preferred workflow for this challenge:

* Keep main as the only long-lived branch.
* Create short-lived feature branches from main.
* Merge each feature branch back into main once the change is working.
* Do not introduce a separate develop branch unless the project grows beyond the challenge scope.
* Avoid working directly on main except for very small documentation fixes.
* Before each commit, verify that the change is scoped, understandable, and does not mix unrelated concerns.
* Never create branches prefixed with `codex/`.
* Branch names must be human-readable and aligned with the change, for example:

feat/scaffold
feat/prisma-schema
feat/auth
feat/visitor-registration
feat/search-and-detail
feat/qr-validation
chore/docker-readme

Commit messages should follow a simple conventional style:

chore: scaffold next app with docker setup
feat: add prisma schema for visitors and entries
feat: implement guard authentication
feat: implement visitor registration backend
feat: build visitor registration workspace
fix: handle duplicate dni registration errors
docs: document local docker setup

The goal is not to create process overhead. The goal is to leave a clear implementation history that shows how the app was built step by step.