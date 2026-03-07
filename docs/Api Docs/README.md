# Admin Dashboard API Docs

This document covers the APIs used by RelayPay admin surfaces.

Related implementation note:
- [Frontend API / Backend Contract Audit](../Frontend_API_Backend_Contract_Audit.md)

Consumers:
- `next-starter`
- future internal admin clients

Derived from:
- [Phase One Main API Docs](../../../breeze-api/docs/phase_one_main_api_docs.md)
- [Organization And Its Feature API Docs](../../../breeze-api/docs/api-docs/Organization_and_its_feature_api_docs.md)
- [Transaction API Docs](../../../breeze-api/docs/api-docs/Transaction_api_docs.md)

## Base

- Base URL: `/api/v1`
- Auth: `Authorization: Bearer <access_token>`
- Content-Type: `application/json`
- External IDs: UUID only

## Dashboard User Roles

- `sy_super_admin`
- `sy_admin`
- `org_super_admin`
- `org_admin`

## Organization Context Rule

Routes using organization context behave as follows:

- org-role users operate inside their own organization automatically
- system-role users must pass `organization_uuid=<organization_uuid>` on org-context routes

Examples of org-context routes:
- `/org`
- `/org/api-keys/*`
- `/payment/settings`
- `/payment/agents/*`
- `/payment/accounts/*`
- `/transactions/*`
- `/users/organization-admins`

## Common Response Shapes

Standard success:

```json
{
  "status": true,
  "message": "Success message",
  "data": {}
}
```

Standard paginated:

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

Auth login and refresh are not wrapped in `status/data`.

## 1. Authentication

### POST `/auth/login`
- login using `user_name + password`
- returns access token, refresh token, expiry fields, and `user`

### POST `/auth/refresh`
- rotates refresh token
- returns a new token pair and `user`

### POST `/auth/logout`
- requires authenticated admin token
- returns `204 No Content`

### GET `/auth/me`
- returns the authenticated admin user profile

## 2. User Management

### System Admin Users
- `GET /users/system-admins`
- `POST /users/system-admins`

Access:
- `sy_super_admin`
- `sy_admin`

Purpose:
- list system-level admins
- create new system admins

### Organization Admin Users
- `GET /users/organization-admins`
- `POST /users/organization-admins`

Access:
- `sy_super_admin`
- `sy_admin`
- `org_super_admin`
- `org_admin`

Purpose:
- list org admins for the active organization context
- create org admins for the active organization context

## 3. Organization Management

### System-Level Organization Management
- `GET /orgs`
- `POST /orgs`
- `GET /orgs/{organization_uuid}`
- `PATCH /orgs/{organization_uuid}`
- `DELETE /orgs/{organization_uuid}`

Access:
- `sy_super_admin`

Purpose:
- create and manage tenant organizations

### Current Organization Context
- `GET /org`
- `PATCH /org`

Access:
- `sy_super_admin`
- `sy_admin`
- `org_super_admin`
- `org_admin`

Purpose:
- read or update the currently selected organization context

## 4. Organization API Keys

- `GET /org/api-keys`
- `POST /org/api-keys`
- `GET /org/api-keys/{api_key_uuid}`
- `PATCH /org/api-keys/{api_key_uuid}`
- `DELETE /org/api-keys/{api_key_uuid}`

Access:
- `sy_super_admin`
- `sy_admin`
- `org_super_admin`
- `org_admin`

Notes:
- key management is always organization-scoped
- `plain_key` is only returned on create or rotate response
- revoked keys are not reusable

## 5. Payment Administration

### Banks

System-level bank management:
- `GET /payment/banks`
- `POST /payment/banks`
- `GET /payment/banks/{bank_uuid}`
- `PATCH /payment/banks/{bank_uuid}`
- `DELETE /payment/banks/{bank_uuid}`

Access:
- `sy_super_admin`
- `sy_admin`

Available bank list for org-facing flows:
- `GET /payment/banks/available-for-org`

Access:
- `sy_super_admin`
- `sy_admin`
- `org_super_admin`
- `org_admin`

### Organization Payment Settings

- `GET /payment/settings`
- `PATCH /payment/settings`

Access:
- `sy_super_admin`
- `sy_admin`
- `org_super_admin`
- `org_admin`

Purpose:
- configure organization payment rules and limits

### Agents

- `GET /payment/agents`
- `POST /payment/agents`
- `GET /payment/agents/find-by-slug/{slug}`
- `GET /payment/agents/{agent_uuid}`
- `PATCH /payment/agents/{agent_uuid}`
- `POST /payment/agents/{agent_uuid}/connect-code`
- `DELETE /payment/agents/{agent_uuid}`

Access:
- `sy_super_admin`
- `sy_admin`
- `org_super_admin`
- `org_admin`

Important behavior:
- `type=user` creates a linked `org_agent` user
- `type=device` creates a device-only agent
- one-time setup secrets may be returned during creation or connect-code rotation

### Organization-Level Accounts

- `GET /payment/accounts`
- `POST /payment/accounts`
- `GET /payment/accounts/{account_uuid}`
- `PATCH /payment/accounts/{account_uuid}`
- `DELETE /payment/accounts/{account_uuid}`

### Accounts Under A Specific Agent

- `GET /payment/agents/{agent_uuid}/accounts`
- `POST /payment/agents/{agent_uuid}/accounts`
- `GET /payment/agents/{agent_uuid}/accounts/{account_uuid}`
- `PATCH /payment/agents/{agent_uuid}/accounts/{account_uuid}`
- `DELETE /payment/agents/{agent_uuid}/accounts/{account_uuid}`

## 6. Dashboard Transaction Operations

- `GET /transactions`
- `POST /transactions/manual`
- `GET /transactions/tracking/{tracking_code}`
- `GET /transactions/{transaction_uuid}`
- `GET /transactions/{transaction_uuid}/events`
- `POST /transactions/{transaction_uuid}/assign`
- `POST /transactions/{transaction_uuid}/reassign`
- `POST /transactions/{transaction_uuid}/reject`
- `POST /transactions/{transaction_uuid}/complete`

Access:
- `sy_super_admin`
- `sy_admin`
- `org_super_admin`
- `org_admin`

Purpose:
- transaction monitoring
- manual operational fallback
- reassignment and override actions
- audit visibility

## 7. Key Admin Notes

- system admins must pass `organization_uuid` for org-context routes
- org admins must not override org context
- manual transaction operations must remain audited
- dashboard APIs and agent/platform APIs are separate surfaces and should not be mixed

## Detailed References

- [Phase One Main API Docs](../../../breeze-api/docs/phase_one_main_api_docs.md)
- [Organization And Its Feature API Docs](../../../breeze-api/docs/api-docs/Organization_and_its_feature_api_docs.md)
- [Transaction API Docs](../../../breeze-api/docs/api-docs/Transaction_api_docs.md)
