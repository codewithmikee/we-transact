# Organization_and_its_feature_api_docs

## Base
- Base URL: `/api/v1`
- Auth: `Authorization: Bearer <token>` (Sanctum token)
- IDs: all external IDs are UUIDs (`id` fields). Do not send/expect internal numeric IDs.

## Common Response Shapes
- Standard success:
```json
{
  "status": true,
  "message": "...",
  "data": {}
}
```
- Standard paginated:
```json
{
  "status": true,
  "message": null,
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 15,
    "total": 0,
    "last_page": 1
  }
}
```
- Auth login/refresh response (not wrapped in `status/data`):
```json
{
  "token": "...",
  "refresh_token": "...",
  "token_expires_at": "2026-03-06T12:00:00.000000Z",
  "refresh_token_expires_at": "2026-03-30T12:00:00.000000Z",
  "user": {}
}
```

## Role + Organization Context Rules
- `sy_super_admin` / `sy_admin`: system roles.
- `org_super_admin` / `org_admin` / `org_agent`: organization roles.
- Endpoints using `require-valid-organization`:
  - org users: organization auto-resolved from authenticated user.
  - system users: must pass query `organization_uuid=<org_uuid>`.

---

## 1. Authentication

### POST `/auth/login`
Body:
```json
{
  "user_name": "super_admin",
  "password": "Super@123"
}
```
Returns token pair + user. If user belongs to organization, `user.organization` is included.

### POST `/auth/refresh`
Body:
```json
{
  "refresh_token": "..."
}
```
Returns new token pair + user.

### POST `/auth/logout`
Requires auth token. Returns `204 No Content`.

### GET `/auth/me`
Returns authenticated user profile (uuid id).

---

## 2. User Admin Management

### GET `/users/system-admins`
Role: `sy_super_admin|sy_admin`
Query supports pagination and sorting:
- `page`, `per_page`, `search`, `sort_by`, `sort_direction`

### POST `/users/system-admins`
Role: `sy_super_admin|sy_admin`
Body:
```json
{
  "name": "John Admin",
  "email": "john.admin@example.com",
  "password": "Password@123",
  "password_confirmation": "Password@123",
  "phone_number": "+2519...",
  "user_name": "john_admin"
}
```
Creates a system admin.

### GET `/users/organization-admins`
Role: `sy_super_admin|sy_admin|org_super_admin|org_admin`
Middleware: `require-valid-organization`
- system roles must pass `?organization_uuid=<org_uuid>`
- org roles do not pass organization query

### POST `/users/organization-admins`
Same auth/middleware as list.
Body same as system admin create.
Creates `org_admin` for resolved organization.

---

## 3. Organizations

### Super Admin Scope (`/orgs`)
Role: `sy_super_admin`

- `GET /orgs`
- `POST /orgs`
Body:
```json
{
  "name": "Acme Org",
  "slug": "acme-org",
  "is_active": true,
  "callback_url": "https://acme.test/callback"
}
```
- `GET /orgs/{organization_uuid}`
- `PATCH /orgs/{organization_uuid}`
- `DELETE /orgs/{organization_uuid}` -> `204`

### Contextual Organization Scope (`/org`)
Role: `sy_super_admin|sy_admin|org_super_admin|org_admin`
Middleware: `require-valid-organization`

- `GET /org`
- `PATCH /org`
Body same as org update.

### Organization API Keys (`/org/api-keys`)
Same role/middleware as `/org`.

- `GET /org/api-keys`
- `POST /org/api-keys`
Body:
```json
{
  "name": "Primary Integration Key",
  "expires_at": "2026-12-31 23:59:59"
}
```
Response includes `plain_key` only on create/rotate response.

- `GET /org/api-keys/{api_key_uuid}`
- `PATCH /org/api-keys/{api_key_uuid}`
Body:
```json
{
  "name": "Renamed Key",
  "rotate": true,
  "expires_at": "2027-01-31 23:59:59"
}
```
- `DELETE /org/api-keys/{api_key_uuid}` -> `204` (revokes key)

---

## 4. Payment Module

### 4.1 Banks

#### Admin bank management
Role: `sy_super_admin|sy_admin`
- `GET /payment/banks`
- `POST /payment/banks`
Body:
```json
{
  "name": "Telebirr",
  "code": "telebirr",
  "is_available": true
}
```
- `GET /payment/banks/{bank_uuid}`
- `PATCH /payment/banks/{bank_uuid}`
- `DELETE /payment/banks/{bank_uuid}` -> `204`

#### Available bank list for org flows
Role: `sy_super_admin|sy_admin|org_super_admin|org_admin`
- `GET /payment/banks/available-for-org`

### 4.2 Organization Payment Settings
Role: `sy_super_admin|sy_admin|org_super_admin|org_admin`
Middleware: `require-valid-organization`
- `GET /payment/settings`
- `PATCH /payment/settings`
Body:
```json
{
  "min_withdraw_allowed": 100,
  "max_withdraw_per_day": 1000,
  "max_withdraw_per_transaction": 200,
  "min_deposit_allowed": 50,
  "max_deposit_per_day": 1500,
  "max_deposit_per_transaction": 300
}
```
Notes:
- settings are auto-created when an organization is created
- initial values come from `config/payment_config.php`
- sending `null` for a setting field resets it back to its config default

### 4.3 Agents
Role: `sy_super_admin|sy_admin|org_super_admin|org_admin`
Middleware: `require-valid-organization`

- `GET /payment/agents`
- `POST /payment/agents`

#### Agent create payload
Required:
- `name`
- `type` (`user` or `device`)

Optional:
- `phone_number`
- `user_name` (for `type=user`)
- `device_name` (for `type=device`)
- `device_metadata` (for `type=device`)
- `accounts` (array) to create accounts together

Example `type=user`:
```json
{
  "name": "Agent Abebe",
  "type": "user",
  "phone_number": "+2519...",
  "user_name": "agent_abebe"
}
```

Example `type=device` with accounts:
```json
{
  "name": "Shop Device",
  "type": "device",
  "device_name": "Samsung A15",
  "device_metadata": {"imei": "123456"},
  "accounts": [
    {
      "bank_id": "<bank_uuid>",
      "holder_name": "Shop Device",
      "account_number": "00112233",
      "status": "ACTIVE",
      "max_withdraw_per_day": 500,
      "max_deposit_per_transaction": 300
    }
  ]
}
```

Business behavior:
- backend always generates `login_code` and `slug`.
- `type=user`: creates linked org-agent user, sets `agent_user_id`, and returns one-time `agent_user_temporary_password`.
- `type=device`: stores device fields only and returns one-time `connect_code` plus `connect_code_expires_at`.

Other endpoints:
- `GET /payment/agents/find-by-slug/{slug}`
- `GET /payment/agents/{agent_uuid}`
- `PATCH /payment/agents/{agent_uuid}`
- `POST /payment/agents/{agent_uuid}/connect-code`
  - device agents only
  - rotates/reissues one-time `connect_code`
- `DELETE /payment/agents/{agent_uuid}` -> `204`

### 4.4 Accounts
Role: `sy_super_admin|sy_admin|org_super_admin|org_admin`
Middleware: `require-valid-organization`

#### Organization-level accounts
- `GET /payment/accounts`
- `POST /payment/accounts`
Body:
```json
{
  "bank_id": "<bank_uuid>",
  "agent_id": "<agent_uuid>",
  "holder_name": "Account Holder",
  "account_number": "00998877",
  "status": "ACTIVE",
  "max_withdraw_per_day": 1000,
  "max_withdraw_per_transaction": 200,
  "max_deposit_per_day": 1500,
  "max_deposit_per_transaction": 300,
  "is_active": true
}
```
Notes:
- when any nullable limit field is omitted or explicitly `null`, backend uses the organization payment-setting default
- `GET /payment/accounts/{account_uuid}`
- `PATCH /payment/accounts/{account_uuid}`
- `DELETE /payment/accounts/{account_uuid}` -> `204` (soft delete)

#### Agent-scoped accounts
- `GET /payment/agents/{agent_uuid}/accounts`
- `POST /payment/agents/{agent_uuid}/accounts`
- `GET /payment/agents/{agent_uuid}/accounts/{account_uuid}`
- `PATCH /payment/agents/{agent_uuid}/accounts/{account_uuid}`
- `DELETE /payment/agents/{agent_uuid}/accounts/{account_uuid}` -> `204`

---

## 5. Agent App API

These routes are for the agent app only and do not use the admin auth flow.

### Agent auth routes

#### POST `/agent/login`
Human user-agent login.
Body:
```json
{
  "user_name": "agent_user_name",
  "password": "Password@123"
}
```

#### POST `/agent/connect`
Device agent first-time connect.
Body:
```json
{
  "login_code": "ABC123",
  "connect_code": "DEVICE789"
}
```

#### POST `/agent/refresh`
Refreshes an agent session.
Body:
```json
{
  "refresh_token": "..."
}
```

#### POST `/agent/logout`
Requires authenticated agent token. Returns `204`.

#### GET `/agent/me`
Returns direct agent session payload:
- `auth_subject_type`: `user_agent | device_agent`
- `agent`
- `user` only for user-agent sessions

### Agent self-service routes

#### PATCH `/agent/availability`
Body:
```json
{
  "is_available": true
}
```
Notes:
- changes only agent availability
- does not change admin `is_active`
- updates `last_seen`

#### GET `/agent/accounts`
Returns only accounts belonging to the authenticated agent.

#### GET `/agent/accounts/{account_uuid}`
Returns one owned account only.

#### PATCH `/agent/accounts/{account_uuid}`

For user agents, allowed fields only:
```json
{
  "status": "BUSY",
  "max_withdraw_per_transaction": 300,
  "max_deposit_per_transaction": 500
}
```

For device agents, allowed fields:
```json
{
  "bank_id": "<bank_uuid>",
  "holder_name": "Device Holder",
  "account_number": "00998877",
  "status": "ACTIVE",
  "max_withdraw_per_day": 1000,
  "max_withdraw_per_transaction": 200,
  "max_deposit_per_day": 1500,
  "max_deposit_per_transaction": 300
}
```

Admin-only fields still forbidden from agent app:
- `is_active`
- `agent_id`
- `organization_id`

#### POST `/agent/accounts`
Device agent only. Creates a new owned account.

#### DELETE `/agent/accounts/{account_uuid}`
Device agent only. Deletes an owned account.

---

## Frontend Integration Notes
- For org-context endpoints, always include `organization_uuid` only when logged in as system role.
- For org-role users, never send `organization_uuid`; middleware rejects override attempts.
- Use pagination metadata to drive table pagination.
- For API key create/rotate, capture and show `plain_key` immediately; it is not returned later.
- Treat `410` as not-found in this project’s exception mapping for some model-not-found paths.
