export class ApiError extends Error {
  constructor(message: string, readonly status: number) { super(message); }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try { response = await fetch(path, { cache: 'no-store', ...init }); }
  catch { throw new ApiError('ارتباط برقرار نشد. اتصال اینترنت را بررسی و دوباره تلاش کنید؛ اطلاعات این فرم حفظ شده است.', 0); }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(typeof data?.error === 'string' ? data.error : 'سرویس موقتاً در دسترس نیست. دوباره تلاش کنید.', response.status);
  if (data === null) throw new ApiError('پاسخ سرویس قابل دریافت نیست. دوباره تلاش کنید.', 502);
  return data as T;
}

export function post<T>(path: string, body: unknown) {
  return api<T>(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
}
