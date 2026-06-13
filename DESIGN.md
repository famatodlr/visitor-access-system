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

The application uses a dark default theme.

This is the only theme.

Do not add a theme toggle.

The palette should feel professional, operational and serious. It should support long periods of use by security personnel without feeling decorative or visually noisy.

Large background areas should be near-black and neutral, not visibly blue. Blue is reserved for primary actions, focus states and small section accents.

Primary

--primary: #2563EB;
--primary-hover: #3B82F6;

Used for:

* primary buttons;
* active states;
* focus indicators.

⸻

Success

--success: #22C55E;

Used for:

* successful registrations;
* valid QR scans.

⸻

Error

--error: #F87171;

Used for:

* validation errors;
* failed operations.

⸻

Warning

--warning: #F59E0B;

Used for:

* camera availability warnings;
* permission or device guidance;
* cautionary states that are not failures.

⸻

Neutral

--background: #09090B;
--surface: #111827;
--surface-elevated: #1A2230;
--border: #2A3445;
--text: #F8FAFC;
--text-secondary: #94A3B8;

The application should primarily use dark neutral colors.

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
└── Product identity + logout

No sidebars.

No multi-level menus.

No dashboard navigation.

Do not add secondary navigation links to the top header.

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

The main workspace contains the real available workflows:

Register Visitor
Search Visitor
Validate QR

These actions should be visible immediately after login.

Use cards or tabs.

Never hide them inside menus.

Do not show unavailable or coming-soon workflows in the main workspace.

Keep workspace copy short and operational. Each card should use a short title, one concise helper line at most and a direct action button.

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

The app surrounding the credential should follow the dark default theme.

The credential itself may remain light or white so the printed output is readable on paper.

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

Printed credentials should remain clean, high contrast and paper-readable even when the application interface is dark.

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

background: var(--surface);
border: 1px solid var(--border);
border-radius: 12px;
padding: 24px;

Cards are the primary layout primitive.

Use var(--surface-elevated) for nested controls, inputs, preview wells and status panels.

⸻

Buttons

Primary button:

Blue background
White text
Brighter blue hover state

Secondary button:

Dark elevated background
Border
Near-white text

Buttons should be clearly distinguishable.

Loading and disabled buttons should look inactive and should not rely only on text changes.

⸻

Forms

Forms should:

* show labels above fields;
* validate immediately when possible;
* display errors near the field.
* keep focus states highly visible on dark backgrounds.

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

* complex dashboards;
* charts;
* analytics screens;
* notification centers;
* animated backgrounds;
* glassmorphism;
* heavy gradients.
* theme toggles.

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
