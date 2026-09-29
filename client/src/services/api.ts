import type { User } from "../types";
export const base = import.meta.env.VITE_API_URL || "/api";
let token: string | null = null;
let refreshPromise: Promise<User | null> | null;
export const setToken = (value: string | null) => {
  token = value;
};
export async function restore() {
  if (!refreshPromise)
    refreshPromise = fetch(`${base}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (response) => {
        if (response.status === 401) {
          token = null;
          return null;
        }
        if (!response.ok)
          throw new Error("Your session could not be restored. Please retry.");
        const data = await response.json();
        token = data.accessToken;
        return data.user;
      })
      .finally(() => {
        refreshPromise = null;
      });
  return refreshPromise;
}
export async function api<T = unknown>(
  path: string,
  options: Omit<RequestInit, "body"> & { body?: unknown } = {},
  retry = true,
): Promise<T> {
  let response;
  try {
    response = await fetch(base + path, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error(
      "Cannot reach the API. Check that the server is running and try again.",
    );
  }
  if (response.status === 401 && retry && !path.startsWith("/auth")) {
    if (await restore()) return api<T>(path, options, false);
    window.dispatchEvent(new Event("auth:expired"));
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.message || "Unable to load data. Please try again.");
  return data;
}
