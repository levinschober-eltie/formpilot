// ═══ FEATURE: Storage Adapter — Customers ═══
// Split from storageAdapter.js for modularity.

import { storageGet, storageSet } from './storage';
import * as supa from './supabaseService';
import { STORAGE_KEYS } from '../config/constants';
import { getOfflineDb } from './offlineDb';
import { syncQueue } from './syncQueue';
import { isSupabaseMode, isNetworkError } from './storageAdapterShared';

// ═══ CUSTOMERS ═══
export async function loadCustomers() {
  if (isSupabaseMode()) {
    try {
      const customers = await supa.getCustomers();
      // Cache in IndexedDB
      const db = await getOfflineDb();
      const tx = db.transaction('customers', 'readwrite');
      for (const c of customers) { await tx.store.put(c); }
      await tx.done;
      return customers;
    } catch (e) {
      console.error('[StorageAdapter] Supabase customers load failed, trying offline cache:', e);
      if (isNetworkError(e)) {
        const db = await getOfflineDb();
        const cached = await db.getAll('customers');
        if (cached && cached.length > 0) return cached;
      }
    }
  }
  return (await storageGet(STORAGE_KEYS.customers)) || [];
}

export async function saveCustomer(customer) {
  if (isSupabaseMode()) {
    if (navigator.onLine) {
      try {
        return await supa.saveCustomer(customer);
      } catch (e) {
        if (isNetworkError(e)) {
          return await _saveCustomerOffline(customer);
        }
        console.error('[StorageAdapter] Supabase customer save failed:', e);
        throw e;
      }
    } else {
      return await _saveCustomerOffline(customer);
    }
  }
  const custs = (await storageGet(STORAGE_KEYS.customers)) || [];
  const idx = custs.findIndex(c => c.id === customer.id);
  if (idx >= 0) custs[idx] = customer; else custs.push(customer);
  await storageSet(STORAGE_KEYS.customers, custs);
  return customer;
}

async function _saveCustomerOffline(customer) {
  const db = await getOfflineDb();
  await db.put('customers', customer);
  await syncQueue.enqueue({
    type: customer.id ? 'update' : 'create',
    entity: 'customer',
    data: customer,
  });
  return customer;
}

export async function deleteCustomer(id) {
  if (isSupabaseMode()) {
    if (navigator.onLine) {
      try {
        return await supa.deleteCustomer(id);
      } catch (e) {
        if (isNetworkError(e)) {
          await syncQueue.enqueue({ type: 'delete', entity: 'customer', data: { id } });
          const db = await getOfflineDb();
          await db.delete('customers', id);
          return;
        }
        console.error('[StorageAdapter] Supabase customer delete failed:', e);
        throw e;
      }
    } else {
      await syncQueue.enqueue({ type: 'delete', entity: 'customer', data: { id } });
      const db = await getOfflineDb();
      await db.delete('customers', id);
      return;
    }
  }
  const custs = ((await storageGet(STORAGE_KEYS.customers)) || []).filter(c => c.id !== id);
  await storageSet(STORAGE_KEYS.customers, custs);
}
