# DevSmartX ERP — Project Rules

These rules are mandatory for all contributors. No exceptions without an approved ADR.

---

## Architecture Rules

- Never modify the architecture without approval and a new ADR in `docs/adr/`.
- Never add libraries without approval. All dependencies must be justified.
- Always follow `docs/01_System_Architecture.md`.
- Always follow the ADR documents in `docs/adr/`.
- Use Feature-Based Architecture only. Never organize code by layer (components/, hooks/, pages/).

## TypeScript Rules

- Never use TypeScript `any`. Use `unknown` and narrow with type guards.
- Enable and respect all strict mode checks.
- No unused variables or parameters.

## Routing Rules

- Never hardcode route strings. Always use constants from `src/shared/constants/routes.ts`.

## Permission Rules

- Never hardcode permission strings. Always use constants from `src/shared/constants/permissions.ts`.

## Component Rules

- Never place business logic inside UI components. Components are presentation only.
- Keep components small and focused on a single responsibility.
- Prefer composition over inheritance.

## Service Layer Rules

- Never bypass the service layer. Components call hooks; hooks call services; services call the network.
- Never call Firebase SDK, Axios, or fetch directly from a component or store.

## Financial Rules

- Never bypass the Transaction Engine for financial operations.
- All financial state (balances, reports, cash flow) must be derived from the transaction ledger.

## File Upload Rules

- Never upload files outside Cloudinary.
- Never use unsigned Cloudinary upload presets.
- Always use `<FileUploader>` from `src/shared/components/upload/`.

## Data Rules

- Never hard delete records. Always soft delete (`isDeleted: true`).
- Every persisted entity must extend `EntityBase`.
- Store all dates as UTC ISO 8601 strings.
- Every monetary value must carry both `amount` and `currencyCode`.

## Code Quality Rules

- No commented-out code committed to the repository.
- No `console.log` in production code.
- Run `npm run lint` and `npm run type-check` before committing.
