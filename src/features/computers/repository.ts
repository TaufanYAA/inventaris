import { BaseRepository } from '../../lib/base.repository';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';

export class ComputersRepository extends BaseRepository<'computers'> {
  constructor() {
    super('computers');
  }

  // Override getById to join laboratory and room details
  async getById(id: string) {
    const { data, error } = await supabase
      .from('computers')
      .select(`
        *,
        laboratory:laboratories(
          lab_name,
          room:rooms(room_name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as any;
  }

  // Override findMany to exclude soft deleted records by default
  async findActive(options: { select?: string; filters?: Record<string, any> } = {}) {
    const filters = { ...options.filters, deleted_at: null };
    return this.findMany({ ...options, filters });
  }

  // Get component change history
  async getComponentHistory(computerId: string) {
    const { data, error } = await supabase
      .from('computer_component_history')
      .select('*')
      .eq('computer_id', computerId)
      .eq('deleted_at', null)
      .order('change_date', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Atomic hardware swap operation (Updates computer specs & inserts history record)
  async swapHardware(
    computerId: string,
    historyData: Database['public']['Tables']['computer_component_history']['Insert'],
    specField: 'processor' | 'motherboard' | 'ram' | 'storage' | 'gpu' | 'monitor_model'
  ) {
    // 1. Insert component change history record
    const { error: historyError } = await supabase
      .from('computer_component_history')
      .insert(historyData);

    if (historyError) throw historyError;

    // 2. Update field specification inside computers table
    const updateData: Record<string, any> = {};
    if (specField === 'monitor_model') {
      updateData.monitor_model = historyData.new_model;
      updateData.monitor_serial = historyData.serial_number_added;
    } else {
      updateData[specField] = historyData.new_model;
    }

    const { data, error: updateError } = await supabase
      .from('computers')
      .update(updateData)
      .eq('id', computerId)
      .select()
      .single();

    if (updateError) throw updateError;
    return data;
  }
}
