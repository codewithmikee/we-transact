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
  password?: string;
  password_confirmation?: string;
  device_name?: string;
}

export interface ResetAgentPasswordInput {
  password: string;
  password_confirmation: string;
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

// ── Transaction Module (Phase 2) ──────────────────────────────────────────────

export type TransactionType = "deposit" | "withdraw";

export type TransactionStatus =
  | "pending"
  | "assigned"
  | "processing"
  | "awaiting_confirmation"
  | "completed"
  | "rejected"
  | "cancelled";

export type TransactionSource = "dashboard" | "platform";

export type TransactionEventType =
  | "created"
  | "started"
  | "assigned"
  | "platform_confirmed"
  | "agent_confirmed"
  | "completed"
  | "rejected"
  | "cancelled"
  | "manual_reassign";

export type TransactionEventActorType = "platform" | "agent" | "admin" | "system";

export interface TransactionResource {
  id: UUID;
  tracking_code: string;
  type: TransactionType;
  status: TransactionStatus;
  source: TransactionSource;
  currency: string;
  /** Decimal value returned as a string, e.g. "500.00" */
  amount: string;
  client_request_id: string | null;
  client_reference: string | null;
  external_reference: string | null;
  client_full_name: string;
  client_phone_number: string | null;
  client_account_holder_name: string | null;
  client_account_number: string | null;
  rejection_reason: string | null;
  client: { id: UUID; full_name: string; phone_number: string | null } | null;
  client_account: {
    id: UUID;
    account_holder_name: string;
    account_number: string;
    account_alias: string | null;
  } | null;
  bank: { id: UUID; name: string; code: string } | null;
  agent: { id: UUID; name: string; slug: string } | null;
  agent_account: { id: UUID; holder_name: string; account_number: string } | null;
  created_by: { id: UUID; name: string; user_name: string } | null;
  requested_at: ISODateString | null;
  assigned_at: ISODateString | null;
  completed_at: ISODateString | null;
  rejected_at: ISODateString | null;
  cancelled_at: ISODateString | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface TransactionEventResource {
  id: UUID;
  event_type: TransactionEventType;
  actor_type: TransactionEventActorType;
  actor_id: UUID | null;
  notes: string | null;
  payload: Record<string, unknown> | null;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export interface TransactionListQuery extends PaginationQuery {
  type?: TransactionType;
  status?: TransactionStatus;
  statuses?: TransactionStatus[];
  source?: TransactionSource;
  tracking_code?: string;
  client_id?: string;
  client_name?: string;
  client_phone_number?: string;
  bank_id?: string;
  agent_id?: string;
}

export interface ManualTransactionInput {
  type: TransactionType;
  currency?: string;
  amount: number;
  bank_id: string;
  agent_account_id?: string;
  client_request_id?: string;
  client_reference?: string;
  external_reference?: string;
  metadata?: Record<string, unknown>;
  client?: {
    id?: string;
    full_name?: string;
    phone_number?: string;
    external_client_id?: string;
    metadata?: Record<string, unknown>;
  };
  client_account?: {
    id?: string;
    account_holder_name?: string;
    account_number?: string;
    account_alias?: string;
  };
}

export interface AssignTransactionInput {
  agent_account_id: string;
  notes?: string;
}

export interface ReassignTransactionInput {
  agent_account_id: string;
  notes?: string;
}

export interface RejectTransactionInput {
  rejection_reason: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

export interface CompleteTransactionInput {
  external_reference?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
}

// ── Platform Transaction Inputs (X-API-KEY auth) ──────────────────────────────

interface PlatformClientInput {
  full_name: string;
  phone_number?: string;
  external_client_id?: string;
}

export interface PlatformDepositInput {
  amount: number;
  bank_id: string;
  agent_account_id: string;
  client_request_id: string;
  client_reference?: string;
  external_reference?: string;
  client: PlatformClientInput;
}

export interface PlatformWithdrawInput {
  amount: number;
  bank_id: string;
  client_request_id: string;
  client_reference?: string;
  external_reference?: string;
  client: PlatformClientInput;
  client_account: {
    account_holder_name: string;
    account_number: string;
    account_alias?: string;
  };
}
