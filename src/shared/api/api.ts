const API_URL = "https://wedev-api.sky.pro";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem("sky_token");
  
  const headers: HeadersInit = {
   
    ...(init?.headers ?? {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers,
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}