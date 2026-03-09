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

export type BankReferenceInputFormat = "direct" | "url" | "sms" | "unknown";
export type BankReferenceEvidenceSource = "agent_inbox" | "client_shared";

export interface BankReferencePlaygroundResult {
  bank: Pick<BankResource, "id" | "name" | "code">;
  input: {
    reference: string;
    sms_sender: string | null;
    evidence_source: BankReferenceEvidenceSource;
    detected_format: BankReferenceInputFormat;
  };
  config_summary: {
    has_config: boolean;
    extractor_names: string[];
    sms_sender_numbers: string[];
    sms_sender_regexes: string[];
    sms_pattern_names: string[];
    receipt_lookup_enabled: boolean;
  };
  extraction: {
    matched: boolean;
    extractor_name: string | null;
    normalized_reference: string | null;
  };
  parsed_transaction: {
    matched: boolean;
    pattern_name: string | null;
    sms_kind: "received" | "transferred" | null;
    amount: number | null;
    occurred_at: ISODateString | null;
    transaction_reference: string | null;
    receipt_url: string | null;
    service_fee: number | null;
    vat_fee: number | null;
    balance: number | null;
    owner_name: string | null;
    sender: {
      name: string | null;
      masked_account: string | null;
    } | null;
    receiver: {
      name: string | null;
      masked_account: string | null;
    } | null;
  };
  flow_mapping: {
    evidence_source: BankReferenceEvidenceSource;
    inferred_transaction_type: "deposit" | "withdraw" | null;
    agent_account: {
      name: string | null;
      masked_account: string | null;
    } | null;
    client_account: {
      name: string | null;
      masked_account: string | null;
    } | null;
    notes: string[];
  };
  sms_validation: {
    provided_sender: string | null;
    has_rules: boolean;
    matches_sender: boolean | null;
    accepted_senders: string[];
    accepted_sender_regexes: string[];
  };
  receipt_lookup: {
    enabled: boolean;
    attempted: boolean;
    successful: boolean | null;
    url: string | null;
    http_status: number | null;
    matched_patterns: string[];
    body_excerpt: string | null;
    error_message: string | null;
  };
  errors: string[];
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
  sim_number?: string | null;
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

export interface StoreBankInput {
  name: string;
  code?: string;
  is_available?: boolean;
}

export interface UpdateBankInput {
  name?: string;
  code?: string;
  is_available?: boolean;
}

export interface BankReferencePlaygroundInput {
  reference: string;
  sms_sender?: string | null;
  evidence_source?: BankReferenceEvidenceSource;
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
  sim_number?: string | null;
  device_metadata?: Record<string, unknown> | null;
  internal_pin?: string | null;
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
  agent_account_id?: string;
  date_from?: string;
  date_to?: string;
  date_field?: "requested_at" | "completed_at";
  timezone?: string;
}

export interface TransactionAnalyticsSummaryQuery {
  date_from: string;
  date_to: string;
  timezone?: string;
  agent_id?: string;
  agent_account_id?: string;
}

export interface TransactionAnalyticsSummary {
  range: {
    date_from: string;
    date_to: string;
    timezone: string;
  };
  scope: {
    organization_id: UUID;
    agent_id: UUID | null;
    agent_account_id: UUID | null;
  };
  completed_summary: {
    total_count: number;
    deposit_count: number;
    withdraw_count: number;
    deposit_amount: string;
    withdraw_amount: string;
    total_amount: string;
  };
  requested_summary: {
    total_count: number;
    by_type: Record<TransactionType, number>;
    by_status: Record<TransactionStatus, number>;
  };
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

// ── Bank Transaction Resolution Tool ──────────────────────────────────────────

export type BankTransactionReferencePattern = "sms" | "url" | "direct";

export type BankTransactionConfirmationStatusValue =
  | "valid"
  | "invalid"
  | "unresponsive"
  | "mismatch";

export interface BankTransactionToolBankResource {
  bank_code: string;
  name: string;
  capabilities: string[];
}

export interface BankTransactionParticipant {
  name: string | null;
  account_number: string | null;
}

export interface BankTransactionData {
  amount: number | null;
  sender: BankTransactionParticipant | null;
  receiver: BankTransactionParticipant | null;
  direction: "sender_to_receiver" | null;
  external_transaction_reference: string | null;
  occurred_at: ISODateString | null;
  status: string | null;
  service_fee: number | null;
  vat_fee: number | null;
  total_paid_amount: number | null;
  balance: number | null;
  receipt_url: string | null;
  payment_mode: string | null;
  payment_reason: string | null;
  payment_channel: string | null;
  customer_note: string | null;
}

export interface ExtractBankTransactionReferenceResult {
  bank_code: string;
  is_valid: boolean;
  pattern: BankTransactionReferencePattern | null;
  external_transaction_reference: string | null;
  bank_link: string | null;
  errors: string[];
}

export interface ParseBankTransactionSmsResult {
  bank_code: string;
  is_valid: boolean;
  errors: string[];
  data: BankTransactionData;
}

export interface ResolveBankTransactionResult {
  bank_code: string;
  reference: ExtractBankTransactionReferenceResult;
  bank_confirmation_status: BankTransactionConfirmationStatusValue;
  http_status: number | null;
  raw_excerpt: string | null;
  errors: string[];
  data: BankTransactionData | null;
}

export interface ValidationCheckResultResource {
  matched: boolean;
  expected: unknown;
  actual: unknown;
}

export interface ValidateBankTransactionSmsResult {
  bank_code: string;
  bank_confirmation_status: BankTransactionConfirmationStatusValue;
  errors: string[];
  parsed_sms: BankTransactionData;
  checks: {
    amount: ValidationCheckResultResource;
    sender_name: ValidationCheckResultResource;
    sender_account_number: ValidationCheckResultResource;
    receiver_name: ValidationCheckResultResource;
    receiver_account_number: ValidationCheckResultResource;
    direction: ValidationCheckResultResource;
  };
}

export interface ValidateBankTransactionResult {
  bank_code: string;
  bank_confirmation_status: BankTransactionConfirmationStatusValue;
  errors: string[];
  reference: ExtractBankTransactionReferenceResult;
  resolved_bank_transaction: BankTransactionData | null;
  checks: {
    amount: ValidationCheckResultResource;
    sender_name: ValidationCheckResultResource;
    sender_account_number: ValidationCheckResultResource;
    receiver_name: ValidationCheckResultResource;
    receiver_account_number: ValidationCheckResultResource;
    direction: ValidationCheckResultResource;
  };
}

// ── AI Registry Module ────────────────────────────────────────────────────────

export type AiProviderDriver =
  | "openai"
  | "openai_compatible"
  | "anthropic"
  | "gemini"
  | "openrouter";

export interface AiProviderResource {
  id: UUID;
  slug: string;
  name: string;
  driver: AiProviderDriver;
  base_url: string | null;
  is_active: boolean;
  created_at: ISODateString | null;
  updated_at: ISODateString | null;
}

export interface AiModelResource {
  id: UUID;
  provider_id: UUID | null;
  model_key: string;
  display_name: string;
  input_price_per_million: string;
  output_price_per_million: string;
  is_active: boolean;
  provider?: {
    id: UUID;
    slug: string;
    name: string;
    driver: AiProviderDriver;
  };
  created_at: ISODateString | null;
  updated_at: ISODateString | null;
}

export interface AiCredentialResource {
  id: UUID;
  provider_id: UUID | null;
  name: string;
  api_key_masked: string;
  is_revoked: boolean;
  revoked_at: ISODateString | null;
  provider?: {
    id: UUID;
    slug: string;
    name: string;
    driver: AiProviderDriver;
  };
  created_at: ISODateString | null;
  updated_at: ISODateString | null;
}

export interface AiCredentialTestResult {
  success: boolean;
  response_code: number | null;
  message: string;
  checked_at: ISODateString;
  credential_id: UUID;
  provider: {
    id: UUID | null;
    slug: string | null;
    driver: AiProviderDriver | string;
  };
}

export interface StoreAiProviderInput {
  name: string;
  slug: string;
  driver: AiProviderDriver;
  base_url?: string | null;
  is_active?: boolean;
}

export type UpdateAiProviderInput = Partial<StoreAiProviderInput>;

export interface StoreAiModelInput {
  provider_id: UUID;
  model_key: string;
  display_name: string;
  input_price_per_million: number | string;
  output_price_per_million: number | string;
  is_active?: boolean;
}

export type UpdateAiModelInput = Partial<StoreAiModelInput>;

export interface StoreAiCredentialInput {
  provider_id: UUID;
  name: string;
  api_key: string;
}

export interface UpdateAiCredentialInput {
  provider_id?: UUID;
  name?: string;
  api_key?: string;
}

export interface AiProviderListQuery extends PaginationQuery {
  driver?: AiProviderDriver;
  is_active?: boolean;
}

export interface AiModelListQuery extends PaginationQuery {
  provider_id?: UUID;
  is_active?: boolean;
}

export interface AiCredentialListQuery extends PaginationQuery {
  provider_id?: UUID;
  is_revoked?: boolean;
}

// ── Agent AI Configuration Module ─────────────────────────────────────────────

export interface AgentAiConfiguration {
  id: UUID;
  agent_id: UUID | null;
  priority: number;
  is_active: boolean;
  is_usable: boolean;
  provider?: {
    id: UUID;
    slug: string;
    name: string;
    driver: AiProviderDriver;
    base_url: string | null;
    is_active: boolean;
  };
  model?: {
    id: UUID;
    model_key: string;
    display_name: string;
    input_price_per_million: string;
    output_price_per_million: string;
    is_active: boolean;
  };
  credential?: {
    id: UUID;
    name: string;
    api_key_masked: string;
    is_revoked: boolean;
  };
  created_at: ISODateString | null;
  updated_at: ISODateString | null;
}

export interface StoreAgentAiConfigurationInput {
  model_id: UUID;
  credential_id: UUID;
  priority: number;
  is_active?: boolean;
}

export type UpdateAgentAiConfigurationInput = Partial<StoreAgentAiConfigurationInput>;

export interface AgentAiConfigurationListQuery extends PaginationQuery {
  organization_uuid?: UUID;
  is_active?: boolean;
}

export interface ResolvedAgentAiConfiguration {
  id: UUID;
  priority: number;
  provider?: {
    id: UUID;
    slug: string;
    name: string;
    driver: AiProviderDriver;
    base_url: string | null;
  };
  model: {
    id: UUID | null;
    model_key: string | null;
    display_name: string | null;
    input_price_per_million: string | null;
    output_price_per_million: string | null;
  };
  credential: {
    id: UUID | null;
    name: string | null;
    api_key: string | null;
  };
}
