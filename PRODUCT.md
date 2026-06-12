Product — Plant Access Control

Plant Access Control is a visitor registration and access-tracking system designed for industrial facilities.

The application replaces paper-based visitor logs with a digital workflow that allows security personnel to register visitors, generate credentials, track facility access and retrieve historical records from any device.

This document defines product behavior, domain rules, architecture decisions and implementation constraints.

It is the source of truth for how the application works.

⸻

Problem Statement

Many industrial facilities still rely on paper logs to track visitors.

A security guard records information manually:

* visitor name;
* national identification number (DNI);
* company;
* destination sector;
* entry time.

This process is slow, error-prone and difficult to audit.

Historical information is hard to search and credentials must be recreated repeatedly.

The objective of this project is to digitize the entire process while keeping the workflow simple enough to be used by a guard during daily operations.

⸻

Solution

The application provides four core capabilities:

1. Register visitors.
2. Generate digital credentials with QR codes.
3. Record future entries using the generated credential.
4. Search visitors and access history.

The application is intentionally small.

The goal is operational efficiency, not enterprise-scale visitor management.

⸻

Core User

The primary user is a facility security guard.

Characteristics:

* works from a desktop or laptop;
* needs fast data entry;
* is not a technical user;
* performs the same actions repeatedly throughout the day.

The interface should optimize for speed, clarity and simplicity.

⸻

User Stories

Visitor registration

As a guard, I want to register a visitor with:

* name;
* DNI;
* company;
* destination sector;
* photograph;

so that I can identify them later.

⸻

Credential generation

As a guard, I want the system to generate a unique QR credential for a visitor,

so that future entries can be registered without re-entering information.

⸻

Visitor lookup

As a guard, I want to search visitors by DNI,

so that I can quickly retrieve their information.

⸻

Access history

As a guard, I want to see all recorded entries for a visitor,

so that I can audit when they entered the facility.

⸻

Authentication

As a guard, I want the application to require authentication,

so that unauthorized users cannot access visitor records.

⸻

Domain Model

Visitor

A visitor represents a person who can enter the facility.

Fields:

id
name
dni
company
sector
photoData
qrToken
createdAt

Rules:

* DNI must be unique.
* QR token must be unique.
* Photo is required.
* Photo is stored in the backend.

⸻

Entry

An entry represents a recorded access event.

Fields:

id
visitorId
createdAt

Rules:

* A visitor can have many entries.
* Entries are immutable historical records.
* Entries are ordered chronologically.

⸻

Registration Flow

Guard logs in
      ↓
Registers visitor
      ↓
Captures photograph
      ↓
System generates QR token
      ↓
Visitor stored in database
      ↓
Initial entry recorded
      ↓
Credential displayed

⸻

QR Flow

Visitor presents QR
      ↓
QR token validated
      ↓
Visitor located
      ↓
New entry created
      ↓
Access registered

QR tokens are permanent identifiers.

A visitor keeps the same credential across future visits.

⸻

Search Flow

Search by DNI
      ↓
Retrieve visitor
      ↓
Display:
  - personal data
  - photograph
  - QR credential
  - entry history

⸻

Authentication

Authentication is intentionally simple.

The application uses:

Guard PIN

stored through environment variables.

Requirements:

* protected routes;
* session cookie;
* no public access to visitor data.

OAuth and external identity providers are out of scope.

⸻

Architecture Decisions

Frontend

Technology:

Next.js
React
TypeScript
Tailwind CSS

Responsibilities:

* forms;
* webcam integration;
* QR visualization;
* search interface;
* credential rendering.

⸻

Backend

Technology:

Next.js Route Handlers
TypeScript

Responsibilities:

* authentication;
* visitor registration;
* QR validation;
* visitor search;
* entry creation.

⸻

Database

Technology:

PostgreSQL
Prisma

Responsibilities:

* visitor persistence;
* photograph persistence;
* entry history persistence.

The database is the source of truth.

⸻

Photos

Visitor photographs are stored as:

Base64 data URLs

inside PostgreSQL.

This decision is intentionally optimized for simplicity and challenge scope.

External object storage is not required.

⸻

Infrastructure

Local Development

Next.js container
PostgreSQL container
Docker Compose

⸻

Production

Application container
Managed PostgreSQL database

Examples:

* Neon
* Supabase
* Railway PostgreSQL

The database must persist independently from the application container.

⸻

Docker Requirements

The application must:

* build from a Dockerfile;
* run through a container image;
* support environment variables;
* be deployable without source code changes.

Docker compatibility is a mandatory requirement.

⸻

Non Goals

The following are explicitly out of scope:

* multiple user roles;
* visitor approval workflows;
* email notifications;
* SMS notifications;
* facial recognition;
* document uploads;
* badge printers;
* biometric access;
* real-time monitoring dashboards;
* audit exports;
* enterprise integrations.

The project should remain intentionally small.

⸻

Success Criteria

A successful implementation allows a reviewer to:

1. Log in.
2. Register a visitor.
3. Capture a photograph.
4. Receive a QR credential.
5. Search by DNI.
6. View visitor history.
7. Validate persistence after reloads and device changes.
8. Access the application through a public URL.
9. Run the application through Docker.

If these actions work reliably, the product goal has been achieved.