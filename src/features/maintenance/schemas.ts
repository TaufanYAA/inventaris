import { z } from 'zod';

export const ticketCreateSchema = z.object({
  reporter_name: z.string().min(1, 'Nama pelapor wajib diisi').max(100),
  reporter_phone: z.string().max(20).nullable().optional(),
  laboratory_id: z.string().uuid('ID Laboratorium tidak valid'),
  computer_id: z.string().uuid().nullable().optional(),
  network_device_id: z.string().uuid().nullable().optional(),
  complaint_details: z.string().min(1, 'Detail keluhan wajib diisi'),
  ticket_status: z.enum(['Open', 'In Review', 'Resolved', 'Closed', 'Escalated']).default('Open'),
  reporter_id: z.string().uuid().nullable().optional(),
  created_by: z.string().uuid().nullable().optional(),
});

export const ticketUpdateSchema = ticketCreateSchema.partial();

export const incidentCreateSchema = z.object({
  ticket_id: z.string().uuid().nullable().optional(),
  incident_title: z.string().min(1, 'Judul insiden wajib diisi').max(150),
  incident_description: z.string().min(1, 'Deskripsi insiden wajib diisi'),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']).default('Medium'),
  incident_status: z.enum(['Open', 'Investigating', 'Workaround', 'Resolved', 'Closed', 'Escalated']).default('Open'),
  resolution_details: z.string().nullable().optional(),
  resolved_at: z.string().nullable().optional(),
  created_by: z.string().uuid().nullable().optional(),
});

export const incidentUpdateSchema = incidentCreateSchema.partial();

export const maintenanceCreateSchema = z.object({
  computer_id: z.string().uuid().nullable().optional(),
  network_device_id: z.string().uuid().nullable().optional(),
  incident_id: z.string().uuid().nullable().optional(),
  technician_id: z.string().uuid('ID Teknisi wajib ditentukan'),
  ticket_title: z.string().min(1, 'Judul pekerjaan wajib diisi').max(150),
  maintenance_status: z.enum(['Pending', 'In Progress', 'Resolved', 'Cancelled']).default('Pending'),
  scheduled_date: z.string().min(1, 'Tanggal pengerjaan wajib ditentukan'),
  completion_date: z.string().nullable().optional(),
  created_by: z.string().uuid().nullable().optional(),
});

export const maintenanceUpdateSchema = maintenanceCreateSchema.partial();

export const maintenanceDetailSchema = z.object({
  maintenance_id: z.string().uuid('ID Pekerjaan tidak valid'),
  action_taken: z.string().min(1, 'Tindakan yang diambil wajib diisi'),
  spareparts_replaced: z.string().nullable().optional(),
  maintenance_cost: z.number().min(0).default(0),
});

export const maintenanceScheduleSchema = z.object({
  schedule_title: z.string().min(1, 'Judul jadwal wajib diisi').max(150),
  schedule_type: z.string().min(1, 'Tipe jadwal wajib diisi'), // e.g. Preventive, Inspection
  target_laboratory_id: z.string().uuid().nullable().optional(),
  target_computer_id: z.string().uuid().nullable().optional(),
  target_network_device_id: z.string().uuid().nullable().optional(),
  interval_months: z.number().int().min(1).default(3),
  last_run_date: z.string().nullable().optional(),
  next_due_date: z.string().min(1, 'Tanggal jatuh tempo berikutnya wajib ditentukan'),
  created_by: z.string().uuid().nullable().optional(),
});
