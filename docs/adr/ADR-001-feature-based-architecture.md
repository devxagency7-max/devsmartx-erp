# ADR-001: Feature-Based Architecture

**Status:** Accepted
**Date:** 2026-08-01
**Authors:** DevSmartX ERP Engineering Team

---

## Context

DevSmartX ERP is planned to have at minimum six distinct business domains: Finance, Projects, CRM, Assets, Reports, and Settings. Each domain has its own entity model, service layer, UI patterns, and permissions model.

Early architectural decisions on how to organize the codebase will have a compounding effect as the system grows. Two primary organizational patterns were considered:

**Option A: Layer-based organization**

```
src/
  components/    (all components from all features)
  hooks/         (all hooks)
  services/      (all services)
  stores/        (all stores)
  pages/         (all pages)
```

**Option B: Feature-based (vertical slice) organization**

```
src/
  features/
    finance/     (all finance-related code: components, hooks, services, stores, pages)
    projects/
    crm/
    ...
  shared/        (only truly cross-cutting concerns)
```

### Problems with Layer-Based Organization

1. **Coupling grows invisibly.** A service in `services/` can import from another service, a hook can import from any component, and nothing in the folder structure prevents cross-domain coupling.
2. **Context switching overhead.** A developer working on an invoice feature must navigate between `components/`, `hooks/`, `services/`, and `pages/` — all distant in the tree — to understand one cohesive unit.
3. **Does not scale.** At 50+ components per domain, a flat `components/` folder becomes unnavigable.
4. **Code splitting is manual.** There is no natural boundary to apply `React.lazy()` if all pages live in one flat `pages/` folder.
5. **Team ownership is unclear.** With layer-based structure, two teams can accidentally edit related files without realizing the overlap.

### Advantages of Feature-Based Organization

1. **Explicit domain boundaries.** The file system enforces that Finance code lives in `features/finance/`. Cross-domain coupling requires an explicit import visible in code review.
2. **Developer locality.** Everything needed to work on invoices is in `features/finance/`.
3. **Natural code splitting.** Each feature's page components are the natural lazy-load boundary.
4. **Barrel exports as a public API.** `features/finance/index.ts` is the only export surface. Internal refactors are invisible to consumers.
5. **Team ownership.** A team can own a feature folder. PR ownership rules (e.g., CODEOWNERS) map naturally.

---

## Decision

DevSmartX ERP will use **feature-based (vertical slice) organization** as defined in Sections 3 and 4 of `docs/01_System_Architecture.md`.

The specific rules are:

1. Every ERP business domain has a dedicated folder under `src/features/`.
2. Each feature folder contains: `components/`, `hooks/`, `services/`, `stores/`, `types/`, `utils/`, `pages/`, and `index.ts`.
3. All imports from outside a feature must go through the feature's `index.ts` barrel export.
4. Features must not import from other features directly. Shared logic is promoted to `src/shared/`.
5. `src/shared/` contains only code that is consumed by two or more features.
6. Route-level components in `pages/` are wrapped with `React.lazy()` for automatic code splitting.
7. Each feature owns its internal implementation exclusively — see Section 30 of the architecture document for the Feature Ownership Rule.

---

## Consequences

### Positive

- **Strong domain isolation.** Bugs, refactors, and new features are contained within one folder 90%+ of the time.
- **Predictable structure.** Every new feature starts from the same folder template.
- **Code review clarity.** A PR touching `features/finance/` is clearly a Finance change.
- **Performance.** Lazy loading at the feature level means users only load JavaScript for modules they visit.
- **Testability.** Each feature's hooks and services can be tested in isolation with straightforward mocking.

### Negative / Trade-offs

- **Shared code must be consciously promoted.** If a developer is not disciplined about identifying shared patterns, they may duplicate code between features before realizing it should be in `shared/`. Code review must watch for this.
- **Barrel export discipline required.** The `index.ts` barrel must be kept accurate. TypeScript strict mode mitigates silent issues.
- **Initial project setup has more folders.** An empty feature folder with subdirectories looks like ceremony for a small feature. This cost is front-loaded and pays off quickly as features grow.

### Rejected Alternatives

- **Layer-based organization** — rejected for the scaling and coupling reasons described in Context.
- **Module federation / micro-frontends** — too complex for the current team size; deferred for future consideration.
- **Monorepo with separate packages per feature** — overhead of package management not justified at this stage. May be revisited when teams exceed 10 engineers per domain.
