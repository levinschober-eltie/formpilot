// ═══ FEATURE: Customers CRUD (split from supabaseService) ═══
import { supabase } from '../supabase';
import { getOrgId } from './auth';

export async function getCustomers() {
  const orgId = await getOrgId();
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('organization_id', orgId)
    .order('name');
  if (error) throw error;
  return (data || []).map(mapCustomerFromDb);
}

export async function getCustomer(id) {
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return mapCustomerFromDb(data);
}

export async function saveCustomer(customer) {
  const orgId = await getOrgId();
  const dbCustomer = mapCustomerToDb(customer, orgId);
  const { data, error } = await supabase
    .from('customers')
    .upsert(dbCustomer, { onConflict: 'id' })
    .select()
    .single();
  if (error) throw error;
  return mapCustomerFromDb(data);
}

export async function deleteCustomer(id) {
  const { error } = await supabase.from('customers').delete().eq('id', id);
  if (error) throw error;
}

// ═══ DATA MAPPERS ═══
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

function mapCustomerToDb(customer, orgId) {
  return {
    id: customer.id || undefined,
    organization_id: orgId,
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
