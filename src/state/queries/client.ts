export function apiBase() {
  // Allow override via env; default to json-server dev port
  return process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "http://localhost:3001"
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`HTTP ${res.status} ${res.statusText}: ${text}`)
  }
  return (await res.json()) as T
}

