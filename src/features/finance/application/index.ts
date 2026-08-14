// Results
export { appOk, appOkVoid, appFail, appValidationFail } from './results/AppResult';
export type { AppResult, AppSuccess, AppFailure, AppError, AppErrorCode, ValidationError, AppWarning } from './results/AppResult';

// Commands
export type { CreateTransactionCommand, UpdateTransactionCommand, SubmitTransactionCommand, ApproveTransactionCommand, RejectTransactionCommand, CancelTransactionCommand, ReverseTransactionCommand, DuplicateTransactionCommand, TransactionCommand } from './commands/TransactionCommands';

// Queries
export type { GetTransactionByIdQuery, GetTransactionListQuery, TransactionDTO, TransactionListDTO } from './queries/TransactionQueries';

// Use case interfaces
export type { ICreateTransactionUseCase, IUpdateTransactionUseCase, ISubmitTransactionUseCase, IApproveTransactionUseCase, IRejectTransactionUseCase, ICancelTransactionUseCase, IReverseTransactionUseCase, IDuplicateTransactionUseCase, IGetTransactionByIdUseCase, IGetTransactionListUseCase } from './use-cases/ITransactionUseCases';

// Validators
export { validateCreateTransaction, validateUpdateTransaction, validateWorkflowTransition } from './validators/TransactionValidator';
export type { TransactionValidationContext } from './validators/TransactionValidator';

// Mappers
export { commandToTransactionRecord, recordToTransactionDTO } from './mappers/TransactionMapper';

// Concrete use case singletons (ready-to-inject implementations)
export {
  createTransactionUseCase,
  updateTransactionUseCase,
  submitTransactionUseCase,
  approveTransactionUseCase,
  rejectTransactionUseCase,
  cancelTransactionUseCase,
  reverseTransactionUseCase,
  duplicateTransactionUseCase,
  getTransactionByIdUseCase,
  getTransactionListUseCase,
} from './use-cases/impl';
