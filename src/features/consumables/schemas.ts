import { z } from 'zod';

export const consumableCreateSchema = z.object({
  item_name: z.string().min(1, 'Nama barang wajib diisi').max(150),
  item_brand: z.string().max(100).nullable().optional(),
  min_stock_alert: z.number().int().min(0).default(10),
  unit_type: z.string().min(1, 'Satuan unit wajib diisi').max(50).default('pcs'),
  item_description: z.string().nullable().optional(),
  created_by: z.string().uuid().nullable().optional(),
});

export const consumableTransactionSchema = z.object({
  consumable_item_id: z.string().uuid('ID Barang tidak valid'),
  transaction_type: z.enum(['Stock In', 'Stock Out']),
  quantity: z.number().int().min(1, 'Jumlah transaksi minimal 1'),
  transaction_date: z.string().min(1, 'Tanggal transaksi wajib ditentukan'),
  recipient_user_id: z.string().uuid().nullable().optional(),
  computer_id: z.string().uuid().nullable().optional(),
  network_device_id: z.string().uuid().nullable().optional(),
  transaction_notes: z.string().nullable().optional(),
  created_by: z.string().uuid().nullable().optional(),
});

export const borrowingCreateSchema = z.object({
  borrower_id: z.string().uuid('ID Peminjam wajib ditentukan'),
  borrow_date: z.string().min(1, 'Tanggal pinjam wajib ditentukan'),
  due_date: z.string().min(1, 'Tanggal jatuh tempo kembali wajib ditentukan'),
  purpose_description: z.string().min(1, 'Tujuan peminjaman wajib diisi'),
  created_by: z.string().uuid().nullable().optional(),
});

export const borrowingDetailSchema = z.object({
  inventory_item_id: z.string().uuid('ID Aset barang tidak valid'),
  quantity: z.number().int().min(1, 'Jumlah pinjam minimal 1'),
  item_condition_out: z.enum(['Baik', 'Maintenance', 'Rusak Ringan', 'Rusak Berat']).default('Baik'),
});
