# ADR-003: Cloudinary Upload Strategy

**Status:** Accepted
**Date:** 2026-08-01
**Authors:** DevSmartX ERP Engineering Team

---

## Context

DevSmartX ERP requires file upload and storage capabilities for:

1. Invoice attachments — PDF and image files.
2. Asset photos — images of physical assets in the Assets module.
3. Profile images — user and company logo uploads.
4. Document storage — contracts, reports, and business documents in CRM and Projects.

### Requirements

- Support image and document (PDF, DOCX, XLSX) uploads.
- Serve images with on-the-fly transformation (resize, format conversion, quality optimization).
- Multi-tenant isolation — a company's files must not be accessible to other companies.
- Signed uploads — the client must not have direct write access using public credentials.
- No custom storage infrastructure to maintain.
- Reasonable pricing for a growing SMB ERP product.

### Options Evaluated

| Criterion | Firebase Storage | AWS S3 | Cloudinary | Supabase Storage |
|---|---|---|---|---|
| Image transformations | No | Requires Lambda/CloudFront | Built-in, URL-based | No |
| CDN delivery | Yes | Yes (+ CloudFront) | Yes (built-in) | Limited |
| Signed uploads | Yes | Yes (presigned URL) | Yes (signed preset) | Yes |
| Multi-tenant isolation | Via Security Rules | Via bucket/prefix policy | Via folder structure | Via RLS |
| Operational complexity | Low | High | Low | Low |
| PDF/document support | Yes | Yes | Yes | Yes |
| Free tier | 5 GB | None | 25 credits/month | 1 GB |
| SDK quality | Good | Good | Excellent (React SDK) | Fair |

### Why Not Firebase Storage

Firebase Storage is the obvious choice given the rest of the stack. The deciding factor against it is the **lack of built-in image transformation**. Firebase Storage serves files as-is. To resize images, convert formats, or optimize quality, a separate Cloud Function pipeline must be built and maintained. Cloudinary solves this with URL-based transformations, requiring no infrastructure.

### Why Not AWS S3

AWS S3 offers the most control but at the highest operational cost. An ERP startup team does not need to manage IAM policies, bucket replication, CloudFront distributions, and Lambda@Edge functions.

---

## Decision

DevSmartX ERP will use **Cloudinary** as the exclusive file upload and storage platform.

Implementation rules:

1. **Signed uploads only.** Upload flow:
   - Client requests a signed signature from the server (`/api/uploads/sign`).
   - Server uses the Cloudinary SDK with the API secret to generate a time-limited signature.
   - Client sends the file directly to Cloudinary's upload API with the signature.
   - Cloudinary returns the public ID and secure URL.
   - Client sends the public ID and URL to the server for persistence in Firestore.

2. **Folder isolation per tenant.** All uploads for a company use the path: `devsmartx/{companyId}/{module}/{resourceType}/`.

3. **Single upload component.** `src/shared/components/upload/FileUploader.tsx` is the only upload UI in the application.

4. **Store references, not binaries.** Firestore stores:
   - `cloudinaryPublicId: string`
   - `secureUrl: string`
   - `resourceType: 'image' | 'raw' | 'video'`
   - `format: string`
   - `bytes: number`

5. **URL construction via utility.** `buildCloudinaryUrl(publicId, transformations)` in `src/shared/utils/cloudinary.ts` handles all Cloudinary URL construction. No component constructs Cloudinary URLs manually.

6. **Deletion policy.** When a file reference is soft-deleted in Firestore, a Cloud Function schedules the Cloudinary asset for deletion after a 30-day grace period.

---

## Consequences

### Positive

- **Zero image processing infrastructure.** Thumbnails, WebP conversion, quality optimization, and responsive variants are URL parameters — no Lambda functions or build pipelines.
- **Excellent React SDK.** `@cloudinary/react` provides `<AdvancedImage>`, `<AdvancedVideo>`, and transformation builder utilities.
- **CDN included.** All assets served from Cloudinary's global CDN automatically.
- **Dashboard visibility.** Per-folder usage statistics enable per-tenant storage auditing.
- **Lazy transformation.** New image sizes or formats can be generated retroactively by changing URL parameters.

### Negative / Trade-offs

- **Second vendor dependency.** The stack now has Firebase (auth + database) and Cloudinary (storage).
- **Signed upload requires a server endpoint.** Cloudinary signed uploads require a server-side signature generation endpoint — one additional round trip and server function.
- **Vendor lock-in.** Cloudinary public IDs and transformation URLs are Cloudinary-specific. The `buildCloudinaryUrl` abstraction limits but does not eliminate the migration surface.
- **Cost at scale.** Cloudinary charges per transformation and per storage GB. Caching transformation results (Cloudinary does this automatically) and restricting which transformations are used in production mitigates this.

### Migration Path

If Cloudinary must be replaced:

1. The upload flow in `FileUploader.tsx` is behind an interface — replace the implementation.
2. `buildCloudinaryUrl()` is the only place Cloudinary URLs are constructed — replace with the new provider's URL scheme.
3. The `secureUrl` values stored in Firestore become the migration source — a batch job updates them to the new CDN URLs.
