import { getToken, clearToken } from "./auth";

type ApiFetchOptions = RequestInit & { auth?: boolean };

export async function apiFetch(input: string, options: ApiFetchOptions = {}) {
  const { auth = true, headers, ...rest } = options;

  const token = getToken();

  const finalHeaders: Record<string, string> = {
    ...(headers as Record<string, string> | undefined),
  };

  if (!finalHeaders["Content-Type"]) {
    finalHeaders["Content-Type"] = "application/json";
  }

  if (auth && token) {
    finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(input, {
    ...rest,
    headers: finalHeaders,
  });

  if (res.status === 401) {
    clearToken();
  }

  return res;
}
