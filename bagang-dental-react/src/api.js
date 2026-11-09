// Tiny fetch wrapper for the backend API.
// In development Vite proxies /api to the Express server (see vite.config.js).
// For a separately hosted API, set VITE_API_URL (e.g. https://api.example.com) at build time.

const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
  } catch {
    throw new Error('Cannot reach the server. Please check your connection and try again.');
  }

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty or non-JSON body */
  }

  if (!res.ok) {
    const err = new Error(data?.error || `Request failed (${res.status}).`);
    err.status = res.status;
    throw err;
  }
  return data;
}

export const createBooking = (payload) =>
  request('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });

export const getBooking = (number) => request(`/api/bookings/${encodeURIComponent(number)}`);

export const sendContactMessage = (payload) =>
  request('/api/contact', { method: 'POST', body: JSON.stringify(payload) });
