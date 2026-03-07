import axios from "axios";

/**
 * Creates a one-off axios instance authenticated with an org API key (X-API-KEY header)
 * for calling platform routes (/platform/*).
 *
 * This is used exclusively for the test-transaction feature in the Integrations page.
 * Never use this client with the admin Bearer token — platform routes reject it.
 */
export function makePlatformClient(plainKey: string) {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-Requested-With": "XMLHttpRequest",
      "X-API-KEY": plainKey,
    },
  });
}
