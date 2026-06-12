Design — Plant Access Control

This document defines the visual language, layout rules and interaction patterns for Plant Access Control.

The application is an operational tool used by security personnel throughout the day.

Design decisions prioritize:

* speed;
* clarity;
* readability;
* low cognitive load.

This is not a marketing website.

This is not a dashboard product.

This is a work tool.

⸻

Design Principles

Operational First

Every screen should help the guard complete a task quickly.

Avoid:

* decorative elements;
* excessive animations;
* unnecessary visual complexity.

The interface should feel closer to an internal business application than a consumer product.

⸻

One Action At A Time

Each screen should have a primary action.

The user should never wonder:

"What am I supposed to do next?"

Actions should be obvious.

⸻

Fast Data Entry

The most common operation is visitor registration.

The registration workflow should require as few clicks as possible.

Forms should be short and direct.

⸻

Readability Over Density

Information should be easy to scan from several feet away.

Important information:

* visitor name;
* DNI;
* company;
* sector;
* timestamps;

must remain highly visible.

⸻

Visual Identity

The application should feel:

Professional
Clean
Modern
Industrial
Reliable

It should not feel:

Playful
Experimental
Startup-like
Gaming-inspired

⸻

Colors

Primary

--primary: #1E40AF;

Used for:

* primary buttons;
* active states;
* focus indicators.

⸻

Success

--success: #15803D;

Used for:

* successful registrations;
* valid QR scans.

⸻

Error

--error: #DC2626;

Used for:

* validation errors;
* failed operations.

⸻

Neutral

--background: #F8FAFC;
--surface: #FFFFFF;
--border: #E2E8F0;
--text: #0F172A;
--text-secondary: #64748B;

The application should primarily use neutral colors.

Color is reserved for meaning.

⸻

Typography

Font:

Inter

Fallback:

system-ui

Typography hierarchy:

Page Title      30px
Section Title   20px
Body            16px
Labels          14px

Use font weight to create hierarchy.

Avoid excessive font sizes.

⸻

Layout

The application uses a centered content container.

Maximum width:

1200px

Default spacing:

8px
16px
24px
32px

No custom spacing values.

⸻

Navigation

The application intentionally avoids complex navigation.

After login, the user lands on a single operational workspace.

Structure:

Header
│
├── Register Visitor
└── Search Visitor

No sidebars.

No multi-level menus.

No dashboard navigation.

⸻

Login Screen

Simple and focused.

Elements:

Logo / Product Name
PIN Input
Login Button

Nothing else.

The login page should feel lightweight and secure.

⸻

Main Workspace

The main workspace contains two primary actions:

Register Visitor
Search Visitor

These actions should be visible immediately after login.

Use cards or tabs.

Never hide them inside menus.

⸻

Visitor Registration

Layout:

Visitor Information | Photo Capture

Two-column layout on desktop.

Single-column layout on mobile.

Fields:

* Name
* DNI
* Company
* Sector

Photo capture should always remain visible while completing the form.

⸻

Credential View

The credential is the most important visual artifact in the application.

It should resemble a real access credential.

Displayed information:

Photo
Name
DNI
Company
Sector
QR Code

The QR code should be large and easy to scan.

⸻

Printing

Credentials should be printable.

Use:

@media print

Hide:

* navigation;
* buttons;
* controls.

Print only the credential.

⸻

Visitor Search

Search interface should be extremely simple.

Layout:

Search Input
Search Button
Result Card

Results show:

* photo;
* personal information;
* QR credential;
* access history.

⸻

Access History

Display history chronologically.

Most recent entry first.

Each row contains:

Date
Time

Avoid tables unless necessary.

Simple stacked rows are preferred.

⸻

Cards

Default style:

background: white;
border: 1px solid var(--border);
border-radius: 12px;
padding: 24px;

Cards are the primary layout primitive.

⸻

Buttons

Primary button:

Blue background
White text

Secondary button:

White background
Border
Dark text

Buttons should be clearly distinguishable.

⸻

Forms

Forms should:

* show labels above fields;
* validate immediately when possible;
* display errors near the field.

Do not rely on placeholders as labels.

⸻

Images

Visitor photographs are functional.

They exist for identification.

Avoid:

* decorative image treatments;
* filters;
* effects.

Photos should be displayed clearly and accurately.

⸻

Responsive Behavior

Desktop is the primary target.

Requirements:

Desktop

Two-column registration layout

Tablet

Adaptive layout

Mobile

Single-column layout

The application must remain usable on all screen sizes.

⸻

Motion

Motion should be subtle.

Allowed:

* fades;
* small transitions;
* hover states.

Avoid:

* large animations;
* parallax;
* bouncing effects.

The application should feel stable and professional.

⸻

Out of Scope

The design intentionally excludes:

* dark mode;
* complex dashboards;
* charts;
* analytics screens;
* notification centers;
* animated backgrounds;
* glassmorphism;
* heavy gradients.

The visual language should remain simple and operational.

⸻

Success Criteria

A successful design allows a first-time user to:

1. Log in.
2. Register a visitor.
3. Capture a photo.
4. Generate a credential.
5. Search by DNI.
6. Find visitor history.

without requiring explanation or training.