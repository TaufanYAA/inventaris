import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceService } from './service';
import { QueryOptions } from '../../lib/base.repository';

export const maintenanceKeys = {
  all: ['maintenance'] as const,
  jobs: () => [...maintenanceKeys.all, 'jobs'] as const,
  jobList: (options: QueryOptions) => [...maintenanceKeys.jobs(), { options }] as const,
  jobDetail: (id: string) => [...maintenanceKeys.all, 'job', id] as const,
  tickets: (filters: Record<string, any>) => [...maintenanceKeys.all, 'tickets', { filters }] as const,
  incidents: (filters: Record<string, any>) => [...maintenanceKeys.all, 'incidents', { filters }] as const,
  schedules: (filters: Record<string, any>) => [...maintenanceKeys.all, 'schedules', { filters }] as const,
};

// Hook: Get all maintenance jobs
export function useMaintenanceJobs(options: QueryOptions = {}) {
  return useQuery({
    queryKey: maintenanceKeys.jobList(options),
    queryFn: () => maintenanceService.getActiveJobs(options),
  });
}

// Hook: Get job details
export function useMaintenanceJob(id: string) {
  return useQuery({
    queryKey: maintenanceKeys.jobDetail(id),
    queryFn: () => maintenanceService.getById(id),
    enabled: !!id,
  });
}

// Hook: Create job
export function useCreateMaintenanceJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => maintenanceService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.jobs() });
    },
  });
}

// Hook: Update job
export function useUpdateMaintenanceJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => maintenanceService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.jobs() });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.jobDetail(variables.id) });
    },
  });
}

// Hook: Get Tickets
export function useTickets(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: maintenanceKeys.tickets(filters),
    queryFn: () => maintenanceService.getTicketsList(filters),
  });
}

// Hook: Submit Ticket
export function useCreateTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => maintenanceService.reportTicket(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance', 'tickets'] });
    },
  });
}

// Hook: Get Incidents
export function useIncidents(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: maintenanceKeys.incidents(filters),
    queryFn: () => maintenanceService.getIncidentsList(filters),
  });
}

// Hook: Promote Ticket to Incident
export function usePromoteTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ incidentData, newTicketStatus }: { incidentData: any; newTicketStatus: 'In Review' | 'Escalated' }) =>
      maintenanceService.promoteTicket(incidentData, newTicketStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance', 'tickets'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance', 'incidents'] });
    },
  });
}

// Hook: Get preventive schedules
export function useSchedules(filters: Record<string, any> = {}) {
  return useQuery({
    queryKey: maintenanceKeys.schedules(filters),
    queryFn: () => maintenanceService.getSchedulesList(filters),
  });
}

// Hook: Create Schedule
export function useCreateSchedule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => maintenanceService.createPreventiveSchedule(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maintenance', 'schedules'] });
    },
  });
}

// Hook: Resolve Maintenance Job with report details
export function useResolveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      maintenanceId,
      detailData,
      targetAsset,
    }: {
      maintenanceId: string;
      detailData: any;
      targetAsset: { type: 'computer' | 'network'; id: string } | null;
    }) => maintenanceService.resolveJob(maintenanceId, detailData, targetAsset),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.jobs() });
      queryClient.invalidateQueries({ queryKey: maintenanceKeys.jobDetail(variables.maintenanceId) });
      queryClient.invalidateQueries({ queryKey: ['computers'] });
      queryClient.invalidateQueries({ queryKey: ['network'] });
    },
  });
}
