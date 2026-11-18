let csrfToken = '';
export function setCsrf(token) {
  csrfToken = token || '';
}
export async function api(path, options = {}) {
  const form = options.body instanceof FormData;
  const response = await fetch(`${import.meta.env.VITE_API_BASE || '/api'}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      ...(form ? {} : { 'Content-Type': 'application/json' }),
      ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
      ...options.headers,
    },
    ...(options.body && !form ? { body: JSON.stringify(options.body) } : {}),
  });
<<<<<<< HEAD
  const data = await response
    .json()
    .catch(() => ({ message: 'The server returned an unreadable response.' }));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status}).`);
=======
    const data = await response.json().catch(() => ({
    message:
      response.status >= 500
        ? 'The backend server is temporarily unavailable. Please try again shortly.'
        : 'The server returned an unreadable response.',
      }));
    if (!response.ok)
      throw new Error(
        data.message || `Request failed (${response.status}).`
    );
>>>>>>> c5b28f4fc52d4b9e5a47b1708d0253400fbe7e94
  return data;
}
export const mutate = (path, body, method = 'POST') => api(path, { method, body });
export const dateTime = (value) =>
  new Intl.DateTimeFormat('en-SG', {
    timeZone: 'Asia/Singapore',
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
export const money = (cents) =>
  new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD' }).format(
    cents / 100,
  );
