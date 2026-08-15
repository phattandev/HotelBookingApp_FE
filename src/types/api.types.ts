/** Khớp với Response<T> trên backend (PascalCase) */
export interface ApiResponse<T = unknown> {
  Succeeded: boolean;
  Message?: string | null;
  Errors?: string[] | null;
  Data?: T | null;
}

/** Khớp với PaginatedResponse<T> trên backend */
export interface PaginatedApiResponse<T = unknown> {
  Succeeded: boolean;
  Data: T[];
  TotalCount: number;
  Page: number;
  PageSize: number;
  TotalPages: number;
}
