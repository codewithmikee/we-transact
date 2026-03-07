# Frontend API / Backend Contract Audit

Last updated: 2026-03-07

Scope:
- frontend app: `next-starter`
- backend contract source: `breeze-api`
- audit focus:
  - route/path correctness
  - request and response type alignment
  - auth headers and query-param behavior

## Summary

The main problem is contract drift between `next-starter` hooks/types and the Laravel API. Auth/header handling is mostly correct. The highest-risk issues are:

1. missing backend routes that the dashboard calls
2. incorrect frontend assumptions about wrapped response payload shapes
3. enum/type mismatches for agent account and numeric decimal fields
4. role-gating mismatches between dashboard visibility and backend authorization

## Priority Findings

### P1. Missing admin status toggle routes

The dashboard calls routes that do not exist on the backend:

- `PATCH /users/system-admins/:uuid`
- `PATCH /users/organization-admins/:uuid`

Frontend callers:
- `src/hooks/api/useSystemAdmins.ts`
- `src/hooks/api/useOrgAdmins.ts`

UI surfaces:
- `src/app/system/users/page.tsx`
- `src/app/org/[slug]/admins/page.tsx`

Backend route source:
- `../breeze-api/routes/api/v1/user.php`

Current backend state:
- only `GET` and `POST` collection routes exist for system admins
- only `GET` and `POST` collection routes exist for organization admins

Impact:
- activate/deactivate actions fail at runtime with `404` or `405`

Required decision:
- either implement the missing PATCH endpoints on the backend
- or remove/disable those dashboard actions

### P1. Response shape mismatch across most hooks

The backend generally returns a resource directly inside `data`, but many dashboard hooks expect a nested property such as `data.organization` or `data.agent`.

Pattern expected by frontend:

```json
{
  "status": true,
  "data": {
    "organization": {}
  }
}
```

Pattern returned by backend:

```json
{
  "status": true,
  "data": {}
}
```

Affected hooks and expected nested keys:

| Frontend hook | Expected key |
| --- | --- |
| `src/hooks/api/useOrgs.ts` | `data.organization` |
| `src/hooks/api/useOrg.ts` | `data.organization` |
| `src/hooks/api/useSystemAdmins.ts` | `data.user` |
| `src/hooks/api/useOrgAdmins.ts` | `data.user` |
| `src/hooks/api/useApiKeys.ts` | `data.api_key` |
| `src/hooks/api/useBanks.ts` | `data.bank` |
| `src/hooks/api/usePaymentSettings.ts` | `data.payment_setting` |
| `src/hooks/api/usePaymentAgents.ts` | `data.agent`, `data.account` |

Backend controller sources:
- `../breeze-api/app/Features/Organization/Http/Controllers/OrganizationController.php`
- `../breeze-api/app/Features/User/Http/Controllers/UserController.php`
- `../breeze-api/app/Features/Organization/Http/Controllers/OrganizationApiKeyController.php`
- `../breeze-api/app/Features/Payment/Http/Controllers/BankController.php`
- `../breeze-api/app/Features/Payment/Http/Controllers/OrganizationPaymentSettingController.php`
- `../breeze-api/app/Features/Payment/Http/Controllers/AgentController.php`
- `../breeze-api/app/Features/Payment/Http/Controllers/AgentAccountController.php`

Impact:
- successful API responses are parsed as missing data
- some pages throw hard errors
- some mutations return `undefined` and break follow-up UI state

Required frontend fix:
- normalize hooks to read the returned resource directly from `response.data`
- update shared response typings to reflect actual payloads

### P1. Agent connect-code endpoint has a special response shape

Frontend assumption:
- `src/hooks/api/usePaymentAgents.ts` expects `data.agent`

Backend response:

```json
{
  "status": true,
  "message": "Connect code generated successfully",
  "data": {
    "agent_id": 1,
    "connect_code": "ABC123",
    "connect_code_expires_at": "2026-03-07T12:00:00Z"
  }
}
```

Backend source:
- `../breeze-api/app/Features/Payment/Http/Controllers/AgentController.php`

Impact:
- connect-code modal flow in `src/app/org/[slug]/agents/page.tsx` will fail even when the backend works correctly

Required frontend fix:
- define a dedicated `RotateAgentConnectCodeResponse` type
- stop treating connect-code rotation as a full `PaymentAgent` response

### P1. Dashboard role visibility does not match backend authorization

Frontend currently exposes organization views broadly to system admins:
- `src/lib/nav-configs/nav-items.ts`
- `src/app/system/page.tsx`

Backend authorization:
- `../breeze-api/routes/api/v1/org.php` restricts `/orgs/*` to `sy_super_admin`

Impact:
- `sy_admin` can see organization UI and trigger requests that return `403`

Required frontend fix:
- hide `/orgs` management surfaces from `sy_admin`
- avoid loading org summary widgets for roles that cannot access the route

### P2. Query parameter type names do not match backend filter names

Frontend shared type:
- `src/types/api.types.ts` uses `sort` and `order`

Backend request contract:
- `../breeze-api/app/Http/Requests/BaseRequests/PaginationFilterRequest.php` expects:
  - `sort_by`
  - `sort_direction`

Impact:
- future sorting calls built against shared types will silently send unsupported params

Required frontend fix:
- rename the shared query types to backend field names
- update any client helpers that serialize list filters

### P2. Agent account status types are incorrect

Frontend type and badge assumptions:
- `src/types/api.types.ts`
- `src/components/data/StatusBadge.tsx`

Current frontend values:
- `active`
- `inactive`
- `suspended`

Backend enum values:
- `INACTIVE`
- `BUSY`
- `ACTIVE`
- `UNAVAILABLE`

Backend source:
- `../breeze-api/app/Enums/AgentAccountStatus.php`

Impact:
- incorrect typing
- wrong badge mapping for real payloads
- missing support for `BUSY` and `UNAVAILABLE`

Required frontend fix:
- align the union type to backend values exactly
- update badge rendering and any filters that use account status

### P2. Decimal fields are typed as numbers, but backend returns strings

Frontend types:
- `src/types/api.types.ts`

Backend models:
- `../breeze-api/app/Models/OrganizationPaymentSetting.php`
- `../breeze-api/app/Models/AgentAccount.php`

Known affected fields include:
- payment setting minimums/maximums
- account limits and balances

Impact:
- shared API typings are wrong
- form and table code will keep performing ad hoc coercion

Required frontend fix:
- represent backend decimals as `string` in API types
- convert to number only inside UI/form helpers when necessary

### P3. `UserRole` type is incomplete

Frontend type:
- `src/types/api.types.ts`

Backend enum:
- `../breeze-api/app/Enums/UserRole.php`

Missing frontend role:
- `org_agent`

Impact:
- low immediate impact for dashboard-only flows
- shared API types are still inaccurate

Required frontend fix:
- add `org_agent` to the union

### P3. Auth/header handling is mostly correct, with one robustness gap

Confirmed correct:
- bearer token attachment in `src/lib/api/client.ts`
- `organization_uuid` is only auto-added for system-role users on org-context requests
- BFF auth routes align with backend auth payloads:
  - login uses `user_name` and `password`
  - refresh uses `refresh_token`
  - logout sends the bearer token

Weaker area:
- `src/hooks/api/useBanks.ts` uses raw `useQuery` instead of the guarded `useApiQuery` pattern used elsewhere

Impact:
- on refresh/reload, bank requests can fire before session bootstrap completes

Required frontend fix:
- move bank queries onto the same guarded query path as the rest of the app

## Recommended Fix Order

1. Fix all response-shape assumptions in hooks and shared response typings.
2. Remove or implement admin status toggle routes.
3. Correct role gating for organization management surfaces.
4. Align enums and API scalar types (`AgentAccountStatus`, decimals, `UserRole`).
5. Align query filter names with backend validators.
6. Normalize bank queries onto the guarded auth-aware query helper.

## Suggested Frontend Acceptance Checklist

- every endpoint in `src/lib/api/endpoints.ts` resolves to a real backend route
- every mutation hook parses the exact response shape returned by the backend controller
- every list/detail hook matches backend query param names and auth expectations
- every enum in `src/types/api.types.ts` matches the backend enum values exactly
- decimal fields are typed as strings at the API layer
- role-based navigation only exposes routes the current role can call successfully

## Source Files Reviewed

Frontend:
- `src/lib/api/endpoints.ts`
- `src/lib/api/client.ts`
- `src/lib/api/auth.ts`
- `src/types/api.types.ts`
- `src/hooks/api/useOrgs.ts`
- `src/hooks/api/useOrg.ts`
- `src/hooks/api/useSystemAdmins.ts`
- `src/hooks/api/useOrgAdmins.ts`
- `src/hooks/api/useApiKeys.ts`
- `src/hooks/api/useBanks.ts`
- `src/hooks/api/usePaymentSettings.ts`
- `src/hooks/api/usePaymentAgents.ts`
- `src/app/system/page.tsx`
- `src/app/system/organizations/page.tsx`
- `src/app/system/users/page.tsx`
- `src/app/org/[slug]/admins/page.tsx`
- `src/app/org/[slug]/integrations/page.tsx`
- `src/app/org/[slug]/payment-setting/page.tsx`
- `src/app/org/[slug]/agents/page.tsx`
- `src/lib/nav-configs/nav-items.ts`

Backend:
- `../breeze-api/routes/api/v1/auth.php`
- `../breeze-api/routes/api/v1/user.php`
- `../breeze-api/routes/api/v1/org.php`
- `../breeze-api/routes/api/v1/payment.php`
- `../breeze-api/routes/api/v1/agent.api.php`
- `../breeze-api/routes/api/v1/platform.php`
- `../breeze-api/routes/api/v1/transactions.php`

## Ownership Note

This document is intended as a frontend implementation handoff. If the backend contract changes, update this audit or replace it with a resolved contract matrix so `next-starter` does not drift again.
