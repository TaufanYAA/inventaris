import { BaseService } from '../../lib/base.service';
import { MaintenanceRepository } from './repository';
import { 
  maintenanceCreateSchema, 
  maintenanceUpdateSchema, 
  ticketCreateSchema, 
  incidentCreateSchema, 
  maintenanceDetailSchema,
  maintenanceScheduleSchema
} from './schemas';
import { supabase } from '../../lib/supabase';

export class MaintenanceService extends BaseService<'maintenance'> {
  protected maintenanceRepository: MaintenanceRepository;

  constructor(repository: MaintenanceRepository) {
    super(repository, maintenanceCreateSchema, maintenanceUpdateSchema);
    this.maintenanceRepository = repository;
  }

  // Get active maintenance tickets
  async getActiveJobs(options = {}) {
    try {
      return await this.maintenanceRepository.findActive(options);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Fetch complaint tickets
  async getTicketsList(filters = {}) {
    try {
      return await this.maintenanceRepository.getTickets(filters);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Create complaint ticket (validated)
  async reportTicket(ticketData: any) {
    try {
      ticketCreateSchema.parse(ticketData);
      
      // Auto-generate ticket number, e.g. TCK-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const countResult = await supabase
        .from('tickets')
        .select('id', { count: 'exact', head: true });
      const nextNum = (countResult.count || 0) + 1;
      const ticketNumber = `TCK-${dateStr}-${nextNum.toString().padStart(3, '0')}`;

      const { data, error } = await supabase
        .from('tickets')
        .insert({ ...ticketData, ticket_number: ticketNumber })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  // Fetch incidents list
  async getIncidentsList(filters = {}) {
    try {
      return await this.maintenanceRepository.getIncidents(filters);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Promote ticket to technical incident
  async promoteTicket(incidentData: any, newTicketStatus: 'In Review' | 'Escalated') {
    try {
      incidentCreateSchema.parse(incidentData);

      // Auto-generate incident number, e.g. INC-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const countResult = await supabase
        .from('incidents')
        .select('id', { count: 'exact', head: true });
      const nextNum = (countResult.count || 0) + 1;
      const incidentNumber = `INC-${dateStr}-${nextNum.toString().padStart(3, '0')}`;

      return await this.maintenanceRepository.promoteTicketToIncident(
        { ...incidentData, incident_number: incidentNumber },
        newTicketStatus
      );
    } catch (err) {
      this.handleError(err);
    }
  }

  // Fetch preventive schedules
  async getSchedulesList(filters = {}) {
    try {
      return await this.maintenanceRepository.getSchedules(filters);
    } catch (err) {
      this.handleError(err);
    }
  }

  // Create preventive schedule
  async createPreventiveSchedule(scheduleData: any) {
    try {
      maintenanceScheduleSchema.parse(scheduleData);
      const { data, error } = await supabase
        .from('maintenance_schedules')
        .insert(scheduleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      this.handleError(err);
    }
  }

  // Complete maintenance job
  async resolveJob(
    maintenanceId: string,
    detailData: any,
    targetAsset: { type: 'computer' | 'network'; id: string } | null
  ) {
    try {
      maintenanceDetailSchema.parse(detailData);
      return await this.maintenanceRepository.completeJob(maintenanceId, detailData, targetAsset);
    } catch (err) {
      this.handleError(err);
    }
  }
}

// Export single instance
export const maintenanceService = new MaintenanceService(new MaintenanceRepository());
