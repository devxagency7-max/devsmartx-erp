export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: ApiResponseError | null;
  meta?: ApiMeta;
}

export interface ApiResponseError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiMeta {
  page?: number;
  pageSize?: number;
  totalCount?: number;
  totalPages?: number;
}
