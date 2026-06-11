import { API_BASE } from './config';

export async function fetchVideos() {
  const res = await fetch(`${API_BASE}/videos`);
  if (!res.ok) throw new Error('Failed to fetch videos');
  return res.json();
}

export async function adminFetchVideos(password) {
  let res;
  try {
    res = await fetch(`${API_BASE}/admin/videos`, {
      headers: { 'x-cms-password': password },
    });
  } catch {
    throw new Error('API server is not running. Use npm run dev (starts Vite + API on port 3001).');
  }
  if (res.status === 401) throw new Error('Invalid password.');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load videos from server.');
  }
  return res.json();
}

export async function adminCreateVideo(password, payload) {
  const res = await fetch(`${API_BASE}/admin/videos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-cms-password': password,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create video');
  return data;
}

export async function adminUpdateVideo(password, id, updates) {
  const res = await fetch(`${API_BASE}/admin/videos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-cms-password': password,
    },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update video');
  return data;
}

export async function adminDeleteVideo(password, id) {
  const res = await fetch(`${API_BASE}/admin/videos/${id}`, {
    method: 'DELETE',
    headers: { 'x-cms-password': password },
  });
  if (!res.ok) throw new Error('Failed to delete video');
  return res.json();
}

export async function fetchMarketRates() {
  const res = await fetch(`${API_BASE}/market-rates`);
  if (!res.ok) throw new Error('Failed to fetch market rates');
  return res.json();
}
