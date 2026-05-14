const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

export async function fetchBrand(brandId) {
  const r = await fetch(`${API_BASE}/brands/${brandId}`);
  if (r.status === 404) throw new Error('brand_not_found');
  if (!r.ok) throw new Error('brand_load_failed');
  return r.json();
}

export async function submitAssessment(brandId, payload) {
  const r = await fetch(`${API_BASE}/submit/${brandId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'submit_failed');
  return data;
}
