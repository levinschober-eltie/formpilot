// ═══ FEATURE: File Storage (split from supabaseService) ═══
import { supabase } from '../supabase';

export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: true });
  if (error) throw error;
  return data;
}

export async function getFileUrl(bucket, path) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || null;
}

export async function getSignedUrl(bucket, path, expiresIn = 3600) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data?.signedUrl || null;
}

export async function deleteFile(bucket, path) {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw error;
}

// ═══ Base64 <-> Storage helpers ═══
export async function uploadBase64(bucket, path, base64String) {
  // Convert base64 to blob
  const match = base64String.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid base64 string');
  const mime = match[1];
  const bytes = atob(match[2]);
  const arr = new Uint8Array(bytes.length);
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
  const blob = new Blob([arr], { type: mime });

  await uploadFile(bucket, path, blob);
  // For private buckets, return the path (use signed URLs for access)
  return path;
}

export async function downloadAsBase64(bucket, path) {
  const { data, error } = await supabase.storage.from(bucket).download(path);
  if (error) throw error;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(data);
  });
}
