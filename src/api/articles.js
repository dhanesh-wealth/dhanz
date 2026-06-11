import { API_BASE } from './config';

export async function fetchArticles() {
  const res = await fetch(`${API_BASE}/articles`);
  if (!res.ok) throw new Error('Failed to fetch articles');
  return res.json();
}

export async function fetchArticle(slug) {
  const res = await fetch(`${API_BASE}/articles/${slug}`);
  if (!res.ok) throw new Error('Article not found');
  return res.json();
}

export async function adminFetchArticles(password) {
  let res;
  try {
    res = await fetch(`${API_BASE}/admin/articles`, {
      headers: { 'x-cms-password': password },
    });
  } catch {
    throw new Error('API server is not running. Use npm run dev (starts Vite + API on port 3001).');
  }
  if (res.status === 401) throw new Error('Invalid password.');
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to load articles from server.');
  }
  return res.json();
}

export async function adminCreateArticle(password, formData) {
  const res = await fetch(`${API_BASE}/admin/articles`, {
    method: 'POST',
    headers: { 'x-cms-password': password },
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to create article');
  return data;
}

export async function adminUpdateArticle(password, id, updates) {
  const res = await fetch(`${API_BASE}/admin/articles/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'x-cms-password': password,
    },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update article');
  return data;
}

export async function adminDeleteArticle(password, id) {
  const res = await fetch(`${API_BASE}/admin/articles/${id}`, {
    method: 'DELETE',
    headers: { 'x-cms-password': password },
  });
  if (!res.ok) throw new Error('Failed to delete article');
  return res.json();
}
