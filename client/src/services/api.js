const base = import.meta.env.VITE_API_URL || "/api";
let token = null;
let refreshPromise;
export const setToken = (value) => {
  token = value;
};
export async function restore() {
  if (!refreshPromise)
    refreshPromise = fetch(`${base}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    })
      .then(async (response) => {
        if (!response.ok) {
          token = null;
          return null;
        }
        const data = await response.json();
        token = data.accessToken;
        return data.user;
      })
      .finally(() => {
        refreshPromise = null;
      });
  return refreshPromise;
}
export async function api(path, options = {}, retry = true) {
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
    if (await restore()) return api(path, options, false);
    window.dispatchEvent(new Event("auth:expired"));
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(data.message || "Unable to load data. Please try again.");
  return data;
}
