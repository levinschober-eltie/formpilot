// ═══ FEATURE: Persistence Layer ═══
// Abstraction over storage — currently localStorage, will migrate to Supabase

const STORAGE_BACKEND = 'localStorage'; // 'localStorage' | 'supabase'

export const storageGet = async (key) => {
  try {
    if (STORAGE_BACKEND === 'supabase') {
      // TODO: Supabase migration (S04/S05)
      // return await supabaseGet(key);
    }
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const storageSet = async (key, value) => {
  try {
    if (STORAGE_BACKEND === 'supabase') {
      // TODO: Supabase migration (S04/S05)
      // return await supabaseSet(key, value);
    }
    if (value === null || value === undefined) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  } catch (e) {
    console.error('Storage error:', e);
  }
};

export const storageDel = async (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Storage delete error:', e);
  }
};
