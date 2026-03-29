// ═══ FEATURE: Customers CRUD — drop-in replacement for supabase/customers.js ═══
import { apiFetch } from './client';

export async function getCustomers() {
  const data = await apiFetch('/api/customers');
  return (data || []).map(mapCustomerFromDb);
}

export async function getCustomer(id) {
  const data = await apiFetch(`/api/customers/${id}`);
  return mapCustomerFromDb(data);
}

export async function saveCustomer(customer) {
  const dbCustomer = mapCustomerToDb(customer);
  let data;
  if (customer.id) {
    data = await apiFetch(`/api/customers/${customer.id}`, {
      method: 'PUT',
      body: JSON.stringify(dbCustomer),
    });
  } else {
    data = await apiFetch('/api/customers', {
      method: 'POST',
      body: JSON.stringify(dbCustomer),
    });
  }
  return mapCustomerFromDb(data);
}

export async function deleteCustomer(id) {
  await apiFetch(`/api/customers/${id}`, { method: 'DELETE' });
}

// ═══ DATA MAPPERS (copied from supabase/customers.js) ═══
function mapCustomerFromDb(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    notes: row.notes,
    metadata: row.metadata || {},
    submissions: row.metadata?.submissions || [],
    activityLog: row.metadata?.activityLog || [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    organizationId: row.organization_id,
  };
}

function mapCustomerToDb(customer) {
  return {
    id: customer.id || undefined,
    name: customer.name,
    email: customer.email || null,
    phone: customer.phone || null,
    address: customer.address || null,
    notes: customer.notes || null,
    metadata: {
      submissions: customer.submissions || [],
      activityLog: customer.activityLog || [],
      ...(customer.metadata || {}),
    },
  };
}
