import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

/* ─── FETCH ALL DATA ─────────────────────────────────────────── */
const transformInventory = (inv) => ({
  ...inv,
  pricePerPc: inv.price_per_pc,
  dateIn: inv.date_in,
  createdAt: inv.created_at,
});

const transformScrap = (scrap) => ({
  ...scrap,
  weightKg: scrap.weight_kg,
  pricePerKg: scrap.price_per_kg,
  totalValue: scrap.total_value,
  dateAdded: scrap.date_added,
  createdAt: scrap.created_at,
});

const transformScrapSales = (sale) => ({
  ...sale,
  kgSold: sale.kg_sold,
  priceKg: sale.price_kg,
  createdAt: sale.created_at,
});

const transformSales = (sale) => ({
  ...sale,
  cutUsed: sale.cut_used,
  remainingCut: sale.remaining_cut,
  createdAt: sale.created_at,
});

const transformDeliveries = (del) => ({
  ...del,
  orderRef: del.order_ref,
  createdAt: del.created_at,
});

const transformSuppliers = (sup) => ({
  ...sup,
  lastOrder: sup.last_order,
  createdAt: sup.created_at,
});

export const fetchAllData = async () => {
  try {
    const [inventory, scrap, scrapSales, sales, deliveries, suppliers] = await Promise.all([
      supabase.from('inventory').select('*'),
      supabase.from('scrap').select('*'),
      supabase.from('scrap_sales').select('*'),
      supabase.from('sales').select('*'),
      supabase.from('deliveries').select('*'),
      supabase.from('suppliers').select('*'),
    ])

    return {
      inventory: (inventory.data || []).map(transformInventory),
      scrap: (scrap.data || []).map(transformScrap),
      scrapSales: (scrapSales.data || []).map(transformScrapSales),
      sales: (sales.data || []).map(transformSales),
      deliveries: (deliveries.data || []).map(transformDeliveries),
      suppliers: (suppliers.data || []).map(transformSuppliers),
    }
  } catch (error) {
    console.error('Error fetching data:', error)
    return { inventory: [], scrap: [], scrapSales: [], sales: [], deliveries: [], suppliers: [] }
  }
}

/* ─── INVENTORY OPERATIONS ───────────────────────────────────── */
export const addInventory = async (item) => {
  const { data, error } = await supabase.from('inventory').insert([item]).select()
  if (error) console.error('Error adding inventory:', error)
  return { data: data ? transformInventory(data[0]) : null, error }
}

export const updateInventory = async (id, updates) => {
  const { data, error } = await supabase.from('inventory').update(updates).eq('id', id).select()
  if (error) console.error('Error updating inventory:', error)
  return data ? transformInventory(data[0]) : null
}

export const deleteInventory = async (id) => {
  const { error } = await supabase.from('inventory').delete().eq('id', id)
  if (error) console.error('Error deleting inventory:', error)
  return !error
}

/* ─── SCRAP OPERATIONS ───────────────────────────────────────── */
export const addScrap = async (item) => {
  const { data, error } = await supabase.from('scrap').insert([item]).select()
  if (error) console.error('Error adding scrap:', error)
  return data ? transformScrap(data[0]) : null
}

export const updateScrap = async (id, updates) => {
  const { data, error } = await supabase.from('scrap').update(updates).eq('id', id).select()
  if (error) console.error('Error updating scrap:', error)
  return data ? transformScrap(data[0]) : null
}

export const deleteScrap = async (id) => {
  const { error } = await supabase.from('scrap').delete().eq('id', id)
  if (error) console.error('Error deleting scrap:', error)
  return !error
}

/* ─── SCRAP SALES OPERATIONS ─────────────────────────────────── */
export const addScrapSale = async (sale) => {
  const { data, error } = await supabase.from('scrap_sales').insert([sale]).select()
  if (error) console.error('Error adding scrap sale:', error)
  return data ? transformScrapSales(data[0]) : null
}

export const deleteScrapSale = async (id) => {
  const { error } = await supabase.from('scrap_sales').delete().eq('id', id)
  if (error) console.error('Error deleting scrap sale:', error)
  return !error
}

/* ─── SALES OPERATIONS ───────────────────────────────────────── */
export const addSale = async (sale) => {
  const { data, error } = await supabase.from('sales').insert([sale]).select()
  if (error) console.error('Error adding sale:', error)
  return data ? transformSales(data[0]) : null
}

export const updateSale = async (id, updates) => {
  const { data, error } = await supabase.from('sales').update(updates).eq('id', id).select()
  if (error) console.error('Error updating sale:', error)
  return data ? transformSales(data[0]) : null
}

export const deleteSale = async (id) => {
  const { error } = await supabase.from('sales').delete().eq('id', id)
  if (error) console.error('Error deleting sale:', error)
  return !error
}

/* ─── DELIVERY OPERATIONS ────────────────────────────────────── */
export const addDelivery = async (delivery) => {
  const { data, error } = await supabase.from('deliveries').insert([delivery]).select()
  if (error) console.error('Error adding delivery:', error)
  return data ? transformDeliveries(data[0]) : null
}

export const updateDelivery = async (id, updates) => {
  const { data, error } = await supabase.from('deliveries').update(updates).eq('id', id).select()
  if (error) console.error('Error updating delivery:', error)
  return data ? transformDeliveries(data[0]) : null
}

export const deleteDelivery = async (id) => {
  const { error } = await supabase.from('deliveries').delete().eq('id', id)
  if (error) console.error('Error deleting delivery:', error)
  return !error
}

/* ─── SUPPLIER OPERATIONS ────────────────────────────────────── */
export const addSupplier = async (supplier) => {
  const { data, error } = await supabase.from('suppliers').insert([supplier]).select()
  if (error) console.error('Error adding supplier:', error)
  return data ? transformSuppliers(data[0]) : null
}

export const updateSupplier = async (id, updates) => {
  const { data, error } = await supabase.from('suppliers').update(updates).eq('id', id).select()
  if (error) console.error('Error updating supplier:', error)
  return data ? transformSuppliers(data[0]) : null
}

export const deleteSupplier = async (id) => {
  const { error } = await supabase.from('suppliers').delete().eq('id', id)
  if (error) console.error('Error deleting supplier:', error)
  return !error
}