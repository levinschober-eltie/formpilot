// ═══ FEATURE: File Storage — drop-in replacement for supabase/storage.js ═══
import { apiFetch, getSessionToken } from './client';

const API_URL = import.meta.env.VITE_API_URL || '';

export async function uploadFile(bucket, path, file) {
  // Convert File/Blob to base64
  const base64String = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  return uploadBase64(bucket, path, base64String);
}

export async function uploadBase64(bucket, path, base64String) {
  const data = await apiFetch('/api/files/upload', {
    method: 'POST',
    body: JSON.stringify({ bucket, path, data: base64String }),
  });
  return data;
}

export async function downloadAsBase64(bucket, path) {
  const data = await apiFetch(`/api/files/download/${encodeURIComponent(bucket)}/${encodeURIComponent(path)}`);
  return data?.data || data;
}

export function getFileUrl(bucket, path) {
  const token = getSessionToken();
  const base = `${API_URL}/api/files/download/${encodeURIComponent(bucket)}/${encodeURIComponent(path)}`;
  return token ? `${base}?token=${encodeURIComponent(token)}` : base;
}

export function getSignedUrl(bucket, path) {
  // With session auth, signed URLs are not needed — same as getFileUrl
  return Promise.resolve(getFileUrl(bucket, path));
}

export async function deleteFile(bucket, path) {
  await apiFetch(`/api/files/${encodeURIComponent(bucket)}/${encodeURIComponent(path)}`, {
    method: 'DELETE',
  });
}
