# DevSmartX ERP

A multi-tenant, role-based enterprise resource planning web application built with React, Vite, and TypeScript.

---

## Requirements

- Node.js >= 20
- npm >= 10

---

## Installation

```bash
npm install
```

Copy the environment file and fill in your credentials:

```bash
cp .env.example .env.local
```

---

## Development

```bash
npm run dev
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | Run TypeScript type checking without emitting |

---

## Folder Structure

```
src/
  app/           # Root app setup: router, providers, global styles
  features/      # ERP feature modules (Finance, Projects, CRM, Assets, Reports, Settings)
  shared/
    components/  # Shared reusable UI components
    hooks/       # Shared hooks
    services/    # API service layer
    stores/      # Zustand stores
    types/       # Global shared types
    utils/       # Pure utility functions
    constants/   # Route and permission constants
    i18n/        # Internationalization config and locale files
    errors/      # Global error types and boundaries
  assets/        # Static assets
  config/        # Environment-aware runtime configuration

docs/
  01_System_Architecture.md  # Full architecture reference
  adr/                       # Architecture Decision Records
```

---

## Coding Rules

See [PROJECT_RULES.md](PROJECT_RULES.md) for the mandatory rules all contributors must follow.

---

## Architecture Documentation

See [ARCHITECTURE.md](ARCHITECTURE.md) for pointers to the full architecture reference and ADR index.

The definitive architecture document is [docs/01_System_Architecture.md](docs/01_System_Architecture.md).
