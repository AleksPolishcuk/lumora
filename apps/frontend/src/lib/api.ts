const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    },
    cache: "no-store"
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.message || "Request failed");
  }
  return res.json();
}

export async function apiAuth<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  return api<T>(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.headers || {})
    }
  });
}
