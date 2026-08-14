# ADR-004: Zustand State Management

**Status:** Accepted
**Date:** 2026-08-01
**Authors:** DevSmartX ERP Engineering Team

---

## Context

DevSmartX ERP requires client-side state management for:

1. **Authentication state** — current user, token, session status.
2. **Tenant context** — active company, user role, permissions matrix, locale, currency, timezone.
3. **Feature UI state** — selected rows, open panels, filter configurations, pagination state.
4. **Server-cache state** — lists of entities fetched from the API, loading and error states.

### Requirements

- Clear, explicit state boundaries — no "god store" that owns everything.
- Minimal boilerplate — state updates should not require action creators, reducers, or dispatchers.
- TypeScript-first — all state fully typed without ceremony.
- Devtools support — state inspection in development.
- Selective subscriptions — components re-render only when the specific state they use changes.
- No React Context performance problems for complex forms and tables.
- Persistence support for auth and tenant state across page reloads.

### Options Evaluated

| Criterion | Redux Toolkit | Zustand | Jotai | MobX | Context + useReducer |
|---|---|---|---|---|---|
| Boilerplate | Medium | Low | Low | Low | Low |
| TypeScript ergonomics | Good | Excellent | Good | Good | Good |
| Bundle size | ~47 KB | ~1 KB | ~3 KB | ~20 KB | 0 KB |
| Devtools | Redux DevTools | Redux DevTools compatible | Jotai DevTools | MobX DevTools | None |
| Selective subscriptions | Yes (useSelector) | Yes (selector param) | Yes (atom granularity) | Yes (observer) | No |
| Persistence middleware | redux-persist | zustand/middleware | jotai/storage | autorun + localStorage | Manual |
| Learning curve | High | Very Low | Low | Medium | Low |
| Multi-store support | Via slices (one store) | Native (many stores) | Native (atoms) | Via multiple observables | Via multiple contexts |
| ERP-scale suitability | Excellent | Good-Excellent | Good | Good | Poor |

### Why Not Redux Toolkit

RTK is the mature, battle-tested choice. The reasons for choosing Zustand instead:

1. **Boilerplate cost at the feature level.** RTK requires defining a slice, exporting actions, exporting selectors, adding the slice to the root reducer, and consuming via `useSelector`/`useDispatch`. For six ERP modules, this ceremony multiplies. Zustand achieves the same result with a single `create()` call.
2. **Feature isolation.** RTK's single-store model makes feature-level store isolation less natural. Zustand's multi-store model maps directly to the feature-based architecture.
3. **Bundle size.** 1 KB vs 47 KB for state management is meaningful for users on slower connections.
4. **TypeScript ergonomics.** Zustand's inference from a single `create()` call is cleaner than RTK's combination of typed `createSlice`, `PayloadAction`, and `RootState` generics.

### Why Not React Context

React Context is appropriate for dependency injection (theme, i18n, modal root). It is not appropriate for application state in an ERP because:
- Every consumer re-renders when any value in the context changes, unless extensive `memo` and split-context patterns are applied.
- Those patterns are high-maintenance and easy to get wrong.
- In an ERP with data-dense tables and forms, unnecessary re-renders cause visible performance degradation.

---

## Decision

DevSmartX ERP will use **Zustand** as the exclusive client-side state management library.

Implementation rules:

1. **Multi-store model.** No single root store. Global stores (`authStore`, `tenantStore`) live in `src/shared/stores/`. Feature stores live in `src/features/<name>/stores/`.

2. **Explicit boundary documentation.** Every store must include a JSDoc comment declaring what it owns and what it explicitly does NOT own.

3. **Selective subscriptions.** Components use selector syntax:
   ```typescript
   // CORRECT — subscribes only to user
   const user = useAuthStore((state) => state.user);

   // WRONG — subscribes to entire store
   const authStore = useAuthStore();
   ```

4. **Persistence.** Only `authStore` and `tenantStore` use `zustand/middleware/persist`. Any other store requiring persistence must justify it in an ADR addendum.

5. **Redux DevTools integration.** All stores use the `devtools` middleware in development. Store names must be descriptive: `devtools(store, { name: 'AuthStore' })`.

6. **Immutable updates.** Use `immer` middleware for complex nested state, or direct object spread for simple updates. Mutating state directly without `immer` is not permitted.

7. **Actions co-located with state.** Store actions are defined inside the `create()` call.

8. **No store-to-store imports in feature stores.** If feature B needs data owned by feature A, that data either belongs in `shared/stores/` or must be passed as a parameter.

9. **Reset on tenant switch.** All feature stores must expose a `reset()` action. The tenant store calls all `reset()` functions when `setActiveCompany()` is invoked.

### Store Template

```typescript
/**
 * STORE BOUNDARY: [Feature/Domain Name]
 * Owns: [list what this store owns]
 * Does NOT own: [list what it defers to other stores]
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface ExampleState {
  items: Item[];
  isLoading: boolean;
  error: AppError | null;
}

interface ExampleActions {
  setItems: (items: Item[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: AppError | null) => void;
  reset: () => void;
}

const initialState: ExampleState = {
  items: [],
  isLoading: false,
  error: null,
};

export const useExampleStore = create<ExampleState & ExampleActions>()(
  devtools(
    (set) => ({
      ...initialState,
      setItems: (items) => set({ items }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      reset: () => set(initialState),
    }),
    { name: 'ExampleStore' },
  ),
);
```

---

## Consequences

### Positive

- **Minimal boilerplate per store.** A new feature store is 30–50 lines including types, initial state, and actions.
- **Natural feature isolation.** Multi-store model maps one-to-one with the feature-based folder structure.
- **Excellent TypeScript inference.** The `create()` generic infers all types.
- **Selective subscriptions by default.** Selector functions prevent over-rendering without additional memoization work.
- **Redux DevTools compatible.** Time-travel debugging and state inspection at no additional cost.
- **Small bundle size.** ~1 KB for the core library.

### Negative / Trade-offs

- **Less opinionated than Redux.** Without the conventions in this document, stores can become inconsistent. The boundary documentation rule and store template enforce consistency.
- **No built-in async handling.** Unlike RTK Query, Zustand has no built-in pattern for async data fetching, loading states, or cache invalidation. The convention is: hooks call services and update the store manually. This is explicit but more verbose.
- **Multi-store coordination requires discipline.** The correct path when features need cross-domain data (promote to shared store or pass as parameter) requires explicit judgment.

### Future Consideration

If server-state management complexity grows significantly (complex cache invalidation, background refetching, optimistic updates), evaluate adding **TanStack Query** for server-cache state while keeping Zustand for UI state and global context. This would be a complementary addition, not a replacement, and would require ADR-005.
