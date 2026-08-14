/**
 * TransactionAttachment — file evidence attached to a transaction.
 *
 * Files are uploaded via Cloudinary (per ADR-003).
 * This entity records metadata only; the actual file lives on Cloudinary CDN.
 */
export interface TransactionAttachment {
  readonly id: string;
  readonly transactionId: string;
  readonly url: string;
  readonly fileName: string;
  readonly fileSize: number;       // bytes
  readonly mimeType: string;
  readonly uploadedAt: string;     // ISO 8601 UTC
  readonly uploadedBy: string;     // userId
}
