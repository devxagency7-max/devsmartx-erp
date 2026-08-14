import type { AppResult } from '../results/AppResult';
import type {
  CreateTransactionCommand,
  UpdateTransactionCommand,
  SubmitTransactionCommand,
  ApproveTransactionCommand,
  RejectTransactionCommand,
  CancelTransactionCommand,
  ReverseTransactionCommand,
  DuplicateTransactionCommand,
} from '../commands/TransactionCommands';
import type { TransactionDTO, TransactionListDTO, GetTransactionByIdQuery, GetTransactionListQuery } from '../queries/TransactionQueries';

/**
 * Use case interfaces for the Transaction domain.
 * Concrete implementations (in-memory, API-backed) must satisfy these contracts.
 * No React. No Zustand. No UI imports.
 */

export interface ICreateTransactionUseCase {
  execute(cmd: CreateTransactionCommand): Promise<AppResult<TransactionDTO>>;
}

export interface IUpdateTransactionUseCase {
  /** Transaction must be in Draft state. */
  execute(cmd: UpdateTransactionCommand): Promise<AppResult<TransactionDTO>>;
}

export interface ISubmitTransactionUseCase {
  /** Draft → Submitted */
  execute(cmd: SubmitTransactionCommand): Promise<AppResult<void>>;
}

export interface IApproveTransactionUseCase {
  /** Submitted → Approved */
  execute(cmd: ApproveTransactionCommand): Promise<AppResult<void>>;
}

export interface IRejectTransactionUseCase {
  /** Submitted | Approved → Rejected */
  execute(cmd: RejectTransactionCommand): Promise<AppResult<void>>;
}

export interface ICancelTransactionUseCase {
  /** Draft | Submitted | Approved → Cancelled */
  execute(cmd: CancelTransactionCommand): Promise<AppResult<void>>;
}

export interface IReverseTransactionUseCase {
  /** Posted | Completed → Reversed. Creates a new reversing transaction. */
  execute(cmd: ReverseTransactionCommand): Promise<AppResult<{ reversingTransactionId: string }>>;
}

export interface IDuplicateTransactionUseCase {
  /** Creates a new Draft copy of any transaction. */
  execute(cmd: DuplicateTransactionCommand): Promise<AppResult<{ newTransactionId: string }>>;
}

export interface IGetTransactionByIdUseCase {
  execute(query: GetTransactionByIdQuery): Promise<AppResult<TransactionDTO>>;
}

export interface IGetTransactionListUseCase {
  execute(query: GetTransactionListQuery): Promise<AppResult<TransactionListDTO>>;
}
