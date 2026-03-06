/**
 * Phase 1 API Type Definitions
 *
 * Generated from the current backend implementation under /api/v1.
 * IDs exposed to frontend are UUID strings.
 */

export type UUID = string;
export type ISODateString = string;

/** Enums */
export type UserRole =
  | 'sy_super_admin'
  | 'sy_admin'
  | 'org_super_admin'
  | 'org_admin' 

/** Generic API wrappers */
export interface ApiSuccessResponse<T> {
  status: true;
  message: string | null;
  data: T;
}

export interface ApiPaginatedMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
}

export interface ApiPaginatedResponse<T> {
  status: true;
  message: string | null;
  data: T[];
  meta: ApiPaginatedMeta;
}

export interface ApiValidationErrorResponse {
  status: false;
  message: string;
  errors: Record<string, string[]>;
  data?: unknown;
}

export interface ApiErrorResponse {
  status: false;
  message: string;
  data?: unknown;
  debug?: {
    exception: string;
    message: string;
    file: string;
    line: number;
  };
}

/** Shared query params */
export interface PaginationQuery {
  /** defaults to 1 */
  page?: number;
  /** defaults to 15; max 100 */
  per_page?: number;
  search?: string;
  sort_by?: string;
  /** defaults to desc */
  sort_direction?: 'asc' | 'desc';
}
 
export interface UserResource {
  id: UUID;
  name: string;
  user_name: string;
  email: string;
  phone_number: string | null;
  role: UserRole;
  is_active: boolean;
  organization?: {
    id: UUID;
    name: string;
    slug: string;
    is_active: boolean;
    callback_url: string | null;
  };
  created_at: ISODateString | null;
  updated_at: ISODateString | null;
}

export interface LoginUser {
  id: UUID;
  name: string;
  user_name: string;
  email: string;
  phone_number: string | null;
  role: UserRole;
  is_active: boolean;
  organization?: {
    id: UUID;
    name: string;
    slug: string;
    is_active: boolean;
    callback_url: string | null;
  };
}
 