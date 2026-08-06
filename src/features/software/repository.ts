import { BaseRepository } from '../../lib/base.repository';
import { supabase } from '../../lib/supabase';

export class SoftwareRepository extends BaseRepository<'software'> {
  constructor() {
    super('software');
  }

  // Get active software catalog items (excluding deleted)
  async findActive(options: { select?: string; filters?: Record<string, any> } = {}) {
    const filters = { ...options.filters, deleted_at: null };
    return this.findMany({ ...options, filters });
  }

  // Fetch software installation list with joined computer details
  async getInstallations(softwareId?: string) {
    let query = supabase
      .from('software_installations')
      .select(`
        *,
        software:software(id, software_name, version, license_type),
        computer:computers(id, computer_name, laboratory_id)
      `)
      .order('installed_date', { ascending: false });

    if (softwareId) {
      query = query.eq('software_id', softwareId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  }
}
