export const AUTH_ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
  ME: "/auth/me",
} as const;

export const USER_ENDPOINTS = {
  SYSTEM_ADMINS: "/users/system-admins",
  SYSTEM_ADMIN: (uuid: string) => `/users/system-admins/${uuid}`,
  ORG_ADMINS: "/users/organization-admins",
} as const;

export const ORG_ENDPOINTS = {
  LIST: "/orgs",
  DETAIL: (uuid: string) => `/orgs/${uuid}`,
  CURRENT: "/org",
  API_KEYS: "/org/api-keys",
  API_KEY: (uuid: string) => `/org/api-keys/${uuid}`,
} as const;

export const PAYMENT_ENDPOINTS = {
  SETTINGS: "/payment/settings",
  BANKS: "/payment/banks",
  BANK: (uuid: string) => `/payment/banks/${uuid}`,
  BANKS_AVAILABLE: "/payment/banks/available-for-org",
  AGENTS: "/payment/agents",
  AGENT: (uuid: string) => `/payment/agents/${uuid}`,
  AGENT_CONNECT_CODE: (uuid: string) => `/payment/agents/${uuid}/connect-code`,
  ACCOUNTS: "/payment/accounts",
  ACCOUNT: (uuid: string) => `/payment/accounts/${uuid}`,
} as const;
