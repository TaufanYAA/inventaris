import { z } from 'zod';

export const softwareCreateSchema = z.object({
  software_name: z.string().min(1, 'Nama software wajib diisi').max(150),
  version: z.string().min(1, 'Versi software wajib diisi').max(30),
  license_key: z.string().max(255).nullable().optional(),
  license_type: z.string().min(1, 'Tipe lisensi wajib diisi').max(100),
  max_install_limit: z.number().int().min(1).nullable().optional(),
  expiry_date: z.string().nullable().optional(),
  created_by: z.string().uuid().nullable().optional(),
});

export const softwareUpdateSchema = softwareCreateSchema.partial();

export const softwareInstallationCreateSchema = z.object({
  computer_id: z.string().uuid('ID Komputer tidak valid'),
  software_id: z.string().uuid('ID Software tidak valid'),
  installed_date: z.string().min(1, 'Tanggal instalasi wajib diisi'),
});
