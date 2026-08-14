# DevSmartX ERP — Architecture Reference

This file is a pointer. The full architecture is maintained in the documents below.

## Primary Reference

[docs/01_System_Architecture.md](docs/01_System_Architecture.md)

The authoritative architecture document. Read this before writing any code.
Covers: folder structure, module registry, routing, state management, API layer, authentication, permissions, multi-tenancy, entity conventions, UI patterns, i18n, error handling, Financial Transaction Engine, audit strategy, and more.

## Architecture Decision Records

[docs/adr/](docs/adr/)

Every significant technology or design decision is recorded as an ADR.

| ADR | Decision |
|---|---|
| [ADR-001](docs/adr/ADR-001-feature-based-architecture.md) | Feature-Based Architecture |
| [ADR-002](docs/adr/ADR-002-firebase-authentication.md) | Firebase Authentication |
| [ADR-003](docs/adr/ADR-003-cloudinary-upload-strategy.md) | Cloudinary Upload Strategy |
| [ADR-004](docs/adr/ADR-004-zustand-state-management.md) | Zustand State Management |

## Project Rules

[PROJECT_RULES.md](PROJECT_RULES.md)

Mandatory coding and architecture rules for all contributors.

---

Do not duplicate architecture content here. Keep this file as a navigation index only.
