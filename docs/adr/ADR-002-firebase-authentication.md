# ADR-002: Firebase Authentication

**Status:** Accepted
**Date:** 2026-08-01
**Authors:** DevSmartX ERP Engineering Team

---

## Context

DevSmartX ERP requires a secure, reliable authentication system that supports:

1. Email and password authentication.
2. OAuth social providers (Google at minimum).
3. Multi-tenant isolation — each user belongs to one or more companies.
4. Role-based access with per-company role assignments.
5. Secure token propagation to all backend API calls.
6. Session persistence and silent refresh.

### Options Evaluated

**Option A: Custom authentication with JWT**
Build an auth server, manage password hashing, implement token issuance, handle refresh token rotation, build email verification flows, manage OAuth provider integrations.

**Option B: Auth0 / Clerk / Supabase Auth**
Third-party auth-as-a-service providers with similar feature sets.

**Option C: Firebase Authentication**
Google's managed auth platform, tightly integrated with the Firestore and Realtime Database ecosystem.

### Evaluation Summary

| Criterion | Custom JWT | Auth0/Clerk | Firebase Auth |
|---|---|---|---|
| Time to production | Weeks | Days | Hours |
| Maintenance burden | High | Low | Low |
| Social provider support | Manual per provider | Built-in | Built-in |
| Token management | Manual | Automatic | Automatic |
| Firestore integration | N/A | Custom setup | Native |
| Offline support | Complex | Limited | Native |
| Pricing at scale | Infrastructure cost | Per-MAU cost | Per-MAU (generous free tier) |
| Vendor lock-in | None | Medium | Medium-High |

### Why Not Auth0 or Clerk

The deciding factor is the tight integration between Firebase Auth and Firestore. Using Firebase Auth means:

- Firebase Security Rules can reference `request.auth.uid` natively, enabling server-enforced data access control without a separate authorization service.
- The `onAuthStateChanged` listener and Firestore's `enablePersistence()` work together seamlessly for offline-capable ERP workflows.
- Firebase Admin SDK verifies tokens in Cloud Functions directly — no JWT validation middleware required.

### Multi-Tenant Consideration

Firebase Auth does not have a native multi-tenancy concept at the user-to-company level. The tenancy model is implemented at the data layer: Firestore documents are organized under `companies/{companyId}/`, and Security Rules verify that the authenticated user's `uid` has an entry in `companies/{companyId}/members/{uid}`. This is the standard Firebase multi-tenancy pattern.

---

## Decision

DevSmartX ERP will use **Firebase Authentication** as the sole authentication provider.

Implementation rules:

1. **Client-side:** Firebase Auth SDK is initialized once in `src/config/firebase.ts`. No other file imports the Firebase Auth SDK directly — all auth operations go through `src/shared/services/authService.ts`.

2. **Token propagation:** The Axios instance in `src/shared/services/apiClient.ts` has a request interceptor that calls `auth.currentUser.getIdToken(true)` before every request.

3. **Auth state:** The `authStore` (Zustand) listens to Firebase's `onAuthStateChanged`. It stores the decoded user identity and exposes `isAuthenticated`, `user`, and `signOut`.

4. **Firestore Security Rules:** Every Firestore collection under `companies/{companyId}/` requires:
   - `request.auth != null` (authenticated).
   - The user exists in `companies/{companyId}/members/{uid}`.
   - The user's role has the required permission for the operation.

5. **Custom claims:** Firebase custom claims store `companyId` and `role` on the token for server-side validation in Cloud Functions, reducing Firestore reads in hot paths.

6. **Password reset and email verification** are handled via Firebase's built-in flows.

---

## Consequences

### Positive

- **Zero auth infrastructure.** Firebase manages token issuance, refresh, storage, and invalidation.
- **Social auth in minutes.** Adding Google, Microsoft, or Apple sign-in requires enabling a provider in the Firebase console and minimal SDK code.
- **Native Firestore integration.** Security Rules leverage auth natively.
- **Offline capability.** Firebase Auth persists sessions locally through network interruptions.
- **Server-side enforcement.** Firestore Security Rules are the real enforcement layer; client checks are UX only.

### Negative / Trade-offs

- **Vendor lock-in to Firebase.** Migrating away requires replacing `authService.ts`, re-implementing token propagation, and rewriting all Firestore Security Rules. The abstraction layer in `authService.ts` limits but does not eliminate this risk.
- **Multi-tenancy is a convention, not a platform feature.** If a developer bypasses the `companyId` scoping convention (e.g., writes a Firestore query without a `companyId` scope), data could leak across tenants. Security Rules are the backstop.
- **Custom claims size limits.** Firebase custom claims are limited to 1,000 bytes. Large permission sets require Firestore lookups at auth time.
- **Firebase emulators required for testing.** Integration tests that touch auth must use the Firebase emulator suite.

### Migration Path

If Firebase Auth must be replaced:

1. `authService.ts` is the only file calling Firebase Auth SDK methods — replace the implementation behind this interface.
2. Token propagation is in `apiClient.ts`'s request interceptor — one function to update.
3. Firestore Security Rules must be ported to the replacement system's authorization model.
4. Firebase custom claims logic moves to the replacement system's equivalent.
