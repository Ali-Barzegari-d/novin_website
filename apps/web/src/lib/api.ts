export class ApiError extends Error { constructor(message: string, public status: number, public correlationId?: string) { super(message); } }

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData) && !headers.has('content-type')) headers.set('content-type', 'application/json');
  const response = await fetch(path, { credentials: 'same-origin', cache: 'no-store', ...init, headers });
  const body = await response.json().catch(() => ({})) as T & { error?: string; correlationId?: string };
  if (!response.ok) throw new ApiError(body.error ?? 'درخواست انجام نشد. دوباره تلاش کنید.', response.status, body.correlationId);
  return body;
}

export function persianDate(value: string | Date) {
  return new Intl.DateTimeFormat('fa-IR-u-ca-persian', { dateStyle: 'long', timeZone: 'Asia/Tehran' }).format(new Date(value));
}

export function money(value: number) {
  return `${new Intl.NumberFormat('fa-IR').format(value)} ریال`;
}
