import { BaseRepository } from '../../lib/base.repository';
import { supabase } from '../../lib/supabase';
import { Database } from '../../types/database.types';

export class MaintenanceRepository extends BaseRepository<'maintenance'> {
  constructor() {
    super('maintenance');
  }

  // Get active maintenance tickets
  async findActive(options: { select?: string; filters?: Record<string, any> } = {}) {
    const filters = { ...options.filters, deleted_at: null };
    return this.findMany({ ...options, filters });
  }

  // Fetch ticket details with joins
  async getTickets(filters = {}) {
    const { data, error } = await supabase
      .from('tickets')
      .select(`
        *,
        laboratory:laboratories(id, lab_name),
        computer:computers(id, computer_name),
        network_device:network_devices(id, device_name)
      `)
      .match(filters)
      .eq('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Fetch incidents list
  async getIncidents(filters = {}) {
    const { data, error } = await supabase
      .from('incidents')
      .select(`
        *,
        ticket:tickets(id, ticket_number, complaint_details)
      `)
      .match(filters)
      .eq('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Fetch preventive schedules
  async getSchedules(filters = {}) {
    const { data, error } = await supabase
      .from('maintenance_schedules')
      .select(`
        *,
        laboratory:laboratories(id, lab_name),
        computer:computers(id, computer_name),
        network_device:network_devices(id, device_name)
      `)
      .match(filters)
      .eq('deleted_at', null)
      .order('next_due_date', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Action: Promote complaint ticket to technical incident
  async promoteTicketToIncident(incidentData: any, newTicketStatus: 'In Review' | 'Escalated') {
    // 1. Create incident record
    const { data: incident, error: incError } = await supabase
      .from('incidents')
      .insert(incidentData)
      .select()
      .single();

    if (incError) throw incError;

    // 2. Update parent ticket status
    if (incidentData.ticket_id) {
      const { error: tckError } = await supabase
        .from('tickets')
        .update({ ticket_status: newTicketStatus })
        .eq('id', incidentData.ticket_id);

      if (tckError) throw tckError;
    }

    return incident;
  }

  // Action: Resolve maintenance job (Write maintenance details & updates specs status)
  async completeJob(
    maintenanceId: string,
    detailData: any,
    targetAsset: { type: 'computer' | 'network'; id: string } | null
  ) {
    // 1. Insert maintenance action report details
    const { error: detailError } = await supabase
      .from('maintenance_details')
      .insert(detailData);

    if (detailError) throw detailError;

    // 2. Update main maintenance job status
    const { data: job, error: jobError } = await supabase
      .from('maintenance')
      .update({
        maintenance_status: 'Resolved',
        completion_date: new Date().toISOString().split('T')[0]
      })
      .eq('id', maintenanceId)
      .select()
      .single();

    if (jobError) throw jobError;

    // 3. Auto-update computer/network device lifecycle state back to 'Active' & condition to 'Baik'
    if (targetAsset) {
      if (targetAsset.type === 'computer') {
        await supabase
          .from('computers')
          .update({ condition: 'Baik', status: 'Aktif', lifecycle_status: 'Active' })
          .eq('id', targetAsset.id);
      } else {
        await supabase
          .from('network_devices')
          .update({ condition: 'Baik', status: 'Aktif', lifecycle_status: 'Active' })
          .eq('id', targetAsset.id);
      }
    }

    return job;
  }
}
