import { z } from 'zod';

export const computerCreateSchema = z.object({
  computer_name: z.string().min(1, 'Nama komputer wajib diisi').max(50),
  laboratory_id: z.string().uuid('ID Laboratorium tidak valid'),
  operating_system: z.enum(['Windows 11', 'Windows 10', 'Ubuntu', 'Debian'], {
    errorMap: () => ({ message: 'Sistem Operasi tidak didukung' }),
  }),
  processor: z.string().max(150).nullable().optional(),
  motherboard: z.string().max(150).nullable().optional(),
  ram: z.string().max(50).nullable().optional(),
  storage: z.string().max(150).nullable().optional(),
  gpu: z.string().max(150).nullable().optional(),
  monitor_brand: z.string().max(100).nullable().optional(),
  monitor_model: z.string().max(100).nullable().optional(),
  monitor_serial: z.string().max(100).nullable().optional(),
  peripheral_details: z.string().nullable().optional(),
  condition: z.enum(['Baik', 'Maintenance', 'Rusak Ringan', 'Rusak Berat']).default('Baik'),
  status: z.enum(['Aktif', 'Nonaktif', 'Cadangan']).default('Aktif'),
  lifecycle_status: z.enum(['Planning', 'Procurement', 'Installed', 'Active', 'Maintenance', 'Retired', 'Disposed']).default('Installed'),
  created_by: z.string().uuid().nullable().optional(),
});

export const computerUpdateSchema = computerCreateSchema.partial();

export const componentHistorySchema = z.object({
  computer_id: z.string().uuid('ID Komputer tidak valid'),
  component_type: z.string().min(1, 'Tipe komponen wajib diisi').max(50), // CPU, RAM, SSD, GPU, dll.
  previous_model: z.string().max(150).nullable().optional(),
  new_model: z.string().min(1, 'Model komponen baru wajib diisi').max(150),
  serial_number_removed: z.string().max(100).nullable().optional(),
  serial_number_added: z.string().max(100).nullable().optional(),
  technician_id: z.string().uuid('ID Teknisi tidak valid'),
  change_reason: z.string().min(1, 'Alasan penggantian wajib diisi'),
  created_by: z.string().uuid().nullable().optional(),
});
