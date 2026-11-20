"use client";
import type { AuthConfig } from "@polyglot/shared-types";
import {
  PublicClientApplication,
  BrowserCacheLocation,
  InteractionRequiredAuthError,
} from "@azure/msal-browser";
export const apiBase =
  process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:5080";
let authPromise:
  | Promise<{ client: PublicClientApplication; config: AuthConfig } | null>
  | undefined;
export async function auth() {
  authPromise ??= (async () => {
    const response = await fetch(apiBase + "/api/auth/config").catch(() => {
      throw Error(
        "Sign-in service is unavailable. You can use the practice preview.",
      );
    });
    if (!response.ok) throw Error("Sign-in service is unavailable.");
    const config: AuthConfig = await response.json();
    if (
      !config.enabled ||
      !config.authority ||
      !config.clientId ||
      !config.scope
    )
      return null;
    const client = new PublicClientApplication({
      auth: {
        clientId: config.clientId,
        authority: config.authority,
        knownAuthorities: [new URL(config.authority).hostname],
        redirectUri: window.location.origin + "/signin",
        postLogoutRedirectUri: window.location.origin,
      },
      cache: { cacheLocation: BrowserCacheLocation.MemoryStorage },
    });
    await client.initialize();
    const result = await client.handleRedirectPromise();
    if (result?.account) client.setActiveAccount(result.account);
    else if (client.getAllAccounts()[0])
      client.setActiveAccount(client.getAllAccounts()[0]);
    return { client, config };
  })();
  try {
    return await authPromise;
  } catch (error) {
    authPromise = undefined;
    throw error;
  }
}
export async function signIn() {
  const value = await auth();
  if (!value)
    throw Error(
      "Sign-in needs an Azure Entra External ID tenant and app registration. The practice preview works without an account.",
    );
  await value.client.loginRedirect({ scopes: [value.config.scope!] });
}
export async function signOut() {
  const value = await auth();
  if (value) await value.client.logoutRedirect();
}
export async function request<T>(
  path: string,
  options: RequestInit = {},
  protectedRoute = false,
  responseKind: "json" | "blob" = "json",
): Promise<T> {
  const headers = new Headers(options.headers);
  if (typeof options.body === "string" && !headers.has("Content-Type"))
    headers.set("Content-Type", "application/json");
  if (protectedRoute) {
    const value = await auth();
    const account = value?.client.getActiveAccount();
    if (!value || !account)
      throw new ApiError(
        401,
        "Sign in to use saved learning and account tools.",
      );
    try {
      const token = await value.client.acquireTokenSilent({
        account,
        scopes: [value.config.scope!],
      });
      headers.set("Authorization", "Bearer " + token.accessToken);
    } catch (error) {
      if (error instanceof InteractionRequiredAuthError)
        throw new ApiError(401, "Please sign in again.");
      throw error;
    }
  }
  let response: Response;
  try {
    response = await fetch(apiBase + path, { ...options, headers });
  } catch {
    throw new ApiError(
      503,
      "The learning service is offline. You can still use the practice preview.",
    );
  }
  if (!response.ok) {
    const problem = await response.json().catch(() => null);
    throw new ApiError(
      response.status,
      problem?.detail ??
        problem?.message ??
        (response.status === 403
          ? "This account does not have permission for this action."
          : "The request could not be completed."),
    );
  }
  if (response.status === 204) return undefined as T;
  return responseKind === "blob"
    ? ((await response.blob()) as T)
    : response.json();
}
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
