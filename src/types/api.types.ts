/**
 * Phase 1 + 2 API Type Definitions
 *
 * Generated from the current backend implementation under /api/v1.
 * IDs exposed to frontend are UUID strings.
 */

export type UUID = string;
export type ISODateString = string;

// ── Enums ─────────────────────────────────────────────────────────────────────

export type UserRole =
  | "sy_super_admin"
  | "sy_admin"
  | "org_super_admin"
  | "org_admin";

export type AgentType = "user" | "device";

export type AgentAccountStatus = "active" | "inactive" | "suspended";

// ── Generic API wrappers ──────────────────────────────────────────────────────

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

// ── Shared query params ───────────────────────────────────────────────────────

export interface PaginationQuery {
  /** defaults to 1 */
  page?: number;
  /** defaults to 15; max 100 */
  per_page?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
}

// ── Resources ─────────────────────────────────────────────────────────────────

export interface OrgResource {
  id: UUID;
  name: string;
  slug: string;
  is_active: boolean;
  callback_url: string | null;
  created_at: ISODateString;
  updated_at: ISODateString;
  users_count?: number;
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

export interface ApiKeyResource {
  id: UUID;
  name: string;
  key_id: string;
  is_revoked: boolean;
  is_expired: boolean;
  expires_at: ISODateString | null;
  revoked_at: ISODateString | null;
  last_used_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
  /** Only present immediately after creation or rotation */
  plain_key?: string;
}

export interface BankResource {
  id: UUID;
  name: string;
  code: string;
  is_available: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PaymentSettingsResource {
  id: UUID;
  min_withdraw_allowed: number;
  max_withdraw_per_day: number;
  max_withdraw_per_transaction: number;
  min_deposit_allowed: number;
  max_deposit_per_day: number;
  max_deposit_per_transaction: number;
  organization: {
    id: UUID;
    name: string;
    slug: string;
  };
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface AgentAccountResource {
  id: UUID;
  holder_name: string;
  account_number: string;
  status: AgentAccountStatus;
  is_active: boolean;
  max_withdraw_per_day: number | null;
  max_withdraw_per_transaction: number | null;
  max_deposit_per_day: number | null;
  max_deposit_per_transaction: number | null;
  bank: Pick<BankResource, "id" | "name" | "code">;
  agent?: {
    id: UUID;
    name: string;
    slug: string;
    type: AgentType;
  };
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface PaymentAgentResource {
  id: UUID;
  name: string;
  type: AgentType;
  login_code: string;
  phone_number: string | null;
  device_name: string | null;
  device_metadata: Record<string, unknown> | null;
  slug: string;
  is_active: boolean;
  is_available: boolean;
  last_seen: ISODateString | null;
  organization: {
    id: UUID;
    name: string;
    slug: string;
  };
  agent_user?: {
    id: UUID;
    name: string;
    user_name: string;
    email: string;
    phone_number: string | null;
    is_active: boolean;
  };
  accounts: AgentAccountResource[];
  /** Only present after generate connect-code */
  connect_code?: string;
  connect_code_expires_at?: ISODateString;
  /** Only present immediately after creation of a user agent */
  agent_user_temporary_password?: string;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// ── Form input types ──────────────────────────────────────────────────────────

export interface StoreUserInput {
  name: string;
  user_name?: string;
  email: string;
  phone_number?: string;
  password: string;
  password_confirmation: string;
  is_active?: boolean;
  role?: UserRole;
}

export interface StoreApiKeyInput {
  name: string;
  expires_at?: string | null;
}

export interface UpdateApiKeyInput {
  name?: string;
  rotate?: boolean;
  expires_at?: string | null;
}

export interface StoreAgentInput {
  name: string;
  type: AgentType;
  phone_number?: string;
  user_name?: string;
  device_name?: string;
}

export interface UpdateAgentInput {
  name?: string;
  phone_number?: string;
  device_name?: string;
  is_active?: boolean;
  is_available?: boolean;
}

export interface StoreAgentAccountInput {
  bank_id: UUID;
  holder_name: string;
  account_number: string;
  status?: AgentAccountStatus;
  max_withdraw_per_day?: number | null;
  max_withdraw_per_transaction?: number | null;
  max_deposit_per_day?: number | null;
  max_deposit_per_transaction?: number | null;
  is_active?: boolean;
}

export type UpdateAgentAccountInput = Partial<StoreAgentAccountInput>;

export interface UpdatePaymentSettingsInput {
  min_withdraw_allowed?: number | null;
  max_withdraw_per_day?: number | null;
  max_withdraw_per_transaction?: number | null;
  min_deposit_allowed?: number | null;
  max_deposit_per_day?: number | null;
  max_deposit_per_transaction?: number | null;
}

export interface UpdateOrgInput {
  name?: string;
  slug?: string;
  is_active?: boolean;
  callback_url?: string | null;
}

export interface StoreOrgInput {
  name: string;
  slug?: string;
  callback_url?: string | null;
}

export interface StoreBankInput {
  name: string;
  code: string;
  is_available?: boolean;
}

export interface UpdateBankInput {
  name?: string;
  code?: string;
  is_available?: boolean;
}
