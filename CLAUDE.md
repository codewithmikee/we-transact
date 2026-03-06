# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build
pnpm lint         # ESLint
pnpm format       # Prettier (all .ts/.tsx files)
pnpm typecheck    # tsc --noEmit
```

Package manager is **pnpm**. Do not use npm or yarn.

## Backend

This frontend connects to **breeze-api** (Laravel 12 + Sanctum), located at `../breeze-api`. Backend runs on **port 8009**. Set `API_BASE_URL=http://localhost:8009/api/v1` in `.env.local`.

### Auth contract
- `POST /api/v1/auth/login` — body: `{ user_name, password }` → returns `{ token, refresh_token, token_expires_at, refresh_token_expires_at, user }`
- `POST /api/v1/auth/refresh` — body: `{ refresh_token }` → same shape as login
- `POST /api/v1/auth/logout` — `Authorization: Bearer {token}`, returns 204
- Access token TTL: 60 min. Refresh token TTL: 30 days.
- All requests use `Authorization: Bearer {token}` header.

### Organization context for system admins
Org-scoped routes (`/org`, `/payment`, `/users/organization-admins`) require context. Org users are auto-scoped; system admins must pass `?organization_uuid=<uuid>`. The API will 403 if an org user passes this param, and 422 if a system admin omits it. The axios client in `src/lib/api/client.ts` injects this automatically from `useSessionStore().activeOrgUuid`.

### API response shapes
All responses use `ApiSuccessResponse<T>`, `ApiPaginatedResponse<T>`, `ApiValidationErrorResponse`, or `ApiErrorResponse` — defined in `src/types/api.types.ts`. Not-found returns **410**, not 404.

## Architecture

### Session management (Phase 1 — implemented)

Auth flow uses a **BFF (Backend-for-Frontend)** pattern:

| Layer | What lives there |
|---|---|
| Zustand (`src/stores/session.store.ts`) | `accessToken` (memory only), `user`, `activeOrgUuid` |
| httpOnly cookie `refresh_token` | Set by BFF, never readable by JS |
| httpOnly cookie `session` | Base64 JSON `{ uuid, role, name, orgSlug, orgUuid }` — used by proxy for routing only |
| Public cookie `token_expires_at` | Read by `SessionProvider` to schedule proactive refresh |

**BFF route handlers** in `src/app/api/auth/` proxy auth calls to breeze-api and set/clear cookies. Clients call `/api/auth/login`, `/api/auth/logout`, `/api/auth/refresh` — never breeze-api auth endpoints directly.

**`SessionProvider`** (`src/providers/SessionProvider.tsx`) mounts at the root layout. On first render, if no access token is in Zustand (page refresh), it calls `/api/auth/refresh` to rehydrate. It also schedules a proactive re-refresh 60 s before expiry.

**`src/proxy.ts`** (Next.js 16 proxy — equivalent to old `middleware.ts`) guards `/system/*`, `/org/*`, and `/login`. It decodes the `session` cookie and redirects unauthenticated users to `/login?redirect=...`. In Next.js 16, the export must be named `proxy` (not `middleware`) and the file must be `proxy.ts`.

**`useUser()`** (`src/hooks/useUser.tsx`) is now a thin wrapper over `useSessionStore` — not a context. Use it in components that need user/role. Use `useSessionStore` directly for session mutation (setSession, clearSession, setActiveOrg).

### Route structure and roles

| Route tree | Roles | Layout |
|---|---|---|
| `/system/*` | `sy_super_admin`, `sy_admin` | `SystemAdminLayout` |
| `/org/[slug]/*` | `org_super_admin`, `org_admin`, and system admins | `OrgAdminLayout` |

When a system admin manages an org, use `OrgAdminLayout` with `isNestedInSystem={true}` — this shows a "Viewing as System Admin" banner with a back link. Set `useSessionStore().activeOrgUuid` to the selected org so the axios client injects `?organization_uuid=<uuid>` automatically.

The four roles: `sy_super_admin`, `sy_admin`, `org_super_admin`, `org_admin`.

### Navigation config

Nav items: `src/lib/nav-configs/nav-items.ts`. `NavConfig = NavItemContent | NavGroup`. `preventerUserRoles` on a `NavItemContent` hides it for those roles — `DynamicSidebar` enforces this using `useSessionStore`. When adding a new icon to a nav item, also add it to the `IconMap` in the relevant layout component.

### Data fetching

- **Auth calls**: always via Next.js BFF (`/api/auth/*`) using `src/lib/api/auth.ts`
- **Data calls**: directly to breeze-api using the axios `apiClient` from `src/lib/api/client.ts` — the interceptor attaches the Bearer token and org context automatically

### Demo page

`/demo/auth` — shows Phase 1 auth in action:
- **SSR section**: reads `session` cookie server-side and displays decoded values
- **CSR section**: renders `<ClientSessionStatus />` which reads Zustand store live
- **Nav section**: annotates nav config items with their `preventerUserRoles`

### Styling

Tailwind CSS v4 with OKLCH color variables. Brand color is indigo-based (`--brand-*`). Use `cn()` from `src/lib/utils.ts`. shadcn/ui components in `src/components/ui/`. Dark mode toggled via the `d` key (next-themes).
