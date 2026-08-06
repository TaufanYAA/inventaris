import { BaseRepository } from '../../lib/base.repository';
import { supabase } from '../../lib/supabase';

export class ConsumablesRepository extends BaseRepository<'consumable_items'> {
  constructor() {
    super('consumable_items');
  }

  // Get active items
  async findActive(options: { select?: string; filters?: Record<string, any> } = {}) {
    const filters = { ...options.filters, deleted_at: null };
    return this.findMany({ ...options, filters });
  }

  // Fetch transaction history
  async getTransactionHistory(itemId?: string) {
    let query = supabase
      .from('consumable_transactions')
      .select(`
        *,
        consumable_item:consumable_items(id, item_name),
        recipient:users!consumable_transactions_recipient_user_id_fkey(id, full_name),
        computer:computers(id, computer_name),
        network_device:network_devices(id, device_name)
      `)
      .order('transaction_date', { ascending: false });

    if (itemId) {
      query = query.eq('consumable_item_id', itemId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }

  // Fetch loans list
  async getBorrowingsList(filters = {}) {
    const { data, error } = await supabase
      .from('borrowing')
      .select(`
        *,
        borrower:users(id, full_name),
        borrowing_details(
          id,
          quantity,
          item_condition_out,
          item_condition_in,
          inventory_item:inventory_items(id, item_name, brand)
        )
      `)
      .match(filters)
      .eq('deleted_at', null)
      .order('borrow_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Execute loan borrowing transaction sequence
  async createLoan(borrowingData: any, items: Array<{ inventory_item_id: string; quantity: number; item_condition_out: string }>) {
    // 1. Create main borrowing transaction
    const { data: borrowing, error: bError } = await supabase
      .from('borrowing')
      .insert(borrowingData)
      .select()
      .single();

    if (bError) throw bError;

    // 2. Insert detail lines and update inventory quantities
    for (const item of items) {
      // Create detail line
      const { error: dError } = await supabase
        .from('borrowing_details')
        .insert({
          borrowing_id: borrowing.id,
          inventory_item_id: item.inventory_item_id,
          quantity: item.quantity,
          item_condition_out: item.item_condition_out as any
        });

      if (dError) throw dError;

      // Decrement available quantity of inventory items
      const { data: invItem, error: fetchErr } = await supabase
        .from('inventory_items')
        .select('available_quantity')
        .eq('id', item.inventory_item_id)
        .single();

      if (fetchErr) throw fetchErr;

      const newQty = (invItem.available_quantity || 0) - item.quantity;
      if (newQty < 0) {
        throw new Error(`Stok tidak mencukupi untuk item dengan ID: ${item.inventory_item_id}`);
      }

      const { error: updateErr } = await supabase
        .from('inventory_items')
        .update({ available_quantity: newQty })
        .eq('id', item.inventory_item_id);

      if (updateErr) throw updateErr;
    }

    return borrowing;
  }

  // Execute return loan transaction sequence
  async returnLoan(borrowingId: string, itemsReturn: Array<{ detail_id: string; inventory_item_id: string; quantity: number; condition_in: string }>) {
    // 1. Update actual return date & status of borrowing
    const { error: bError } = await supabase
      .from('borrowing')
      .update({
        actual_return_date: new Date().toISOString().split('T')[0],
        borrowing_status: 'Kembali'
      })
      .eq('id', borrowingId);

    if (bError) throw bError;

    // 2. Update conditions and increment available quantity back to store stock
    for (const item of itemsReturn) {
      const { error: dError } = await supabase
        .from('borrowing_details')
        .update({ item_condition_in: item.condition_in as any })
        .eq('id', item.detail_id);

      if (dError) throw dError;

      // Increment available quantity of inventory items
      const { data: invItem, error: fetchErr } = await supabase
        .from('inventory_items')
        .select('available_quantity')
        .eq('id', item.inventory_item_id)
        .single();

      if (fetchErr) throw fetchErr;

      const newQty = (invItem.available_quantity || 0) + item.quantity;

      const { error: updateErr } = await supabase
        .from('inventory_items')
        .update({ available_quantity: newQty })
        .eq('id', item.inventory_item_id);

      if (updateErr) throw updateErr;
    }

    return true;
  }
}
