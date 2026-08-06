import { z } from 'zod';

export const networkDeviceCreateSchema = z.object({
  device_name: z.string().min(1, 'Nama perangkat wajib diisi').max(100),
  device_type: z.enum(['Router', 'Switch', 'Access Point', 'Firewall', 'Server', 'UPS', 'ONU']),
  brand: z.string().min(1, 'Merek perangkat wajib diisi').max(100),
  model_name: z.string().min(1, 'Model perangkat wajib diisi').max(100),
  serial_number: z.string().max(100).nullable().optional(),
  room_id: z.string().uuid('ID Ruangan tidak valid'),
  internet_provider_id: z.string().uuid().nullable().optional(),
  condition: z.enum(['Baik', 'Maintenance', 'Rusak Ringan', 'Rusak Berat']).default('Baik'),
  status: z.enum(['Aktif', 'Nonaktif', 'Cadangan']).default('Aktif'),
  lifecycle_status: z.enum(['Planning', 'Procurement', 'Installed', 'Active', 'Maintenance', 'Retired', 'Disposed']).default('Installed'),
  created_by: z.string().uuid().nullable().optional(),
});

export const networkDeviceUpdateSchema = networkDeviceCreateSchema.partial();

export const switchPortCreateSchema = z.object({
  network_device_id: z.string().uuid('ID Switch tidak valid'),
  port_name: z.string().min(1, 'Nama port wajib diisi').max(30),
  port_speed: z.string().default('1 Gbps'),
  vlan_id: z.number().int().min(1).max(4094).nullable().optional(),
  poe_supported: z.boolean().default(false),
  poe_enabled: z.boolean().default(false),
  port_status: z.enum(['Up', 'Down', 'Disabled']).default('Down'),
  connected_device_type: z.enum(['Computer', 'Network Device', 'Access Point', 'Server', 'UPS', 'None']).default('None'),
  connected_computer_id: z.string().uuid().nullable().optional(),
  connected_network_device_id: z.string().uuid().nullable().optional(),
  connected_patch_panel_port: z.string().max(30).nullable().optional(),
  created_by: z.string().uuid().nullable().optional(),
});

export const switchPortUpdateSchema = switchPortCreateSchema.partial();

export const ipAddressCreateSchema = z.object({
  ip_address: z.string().ip({ version: 'v4', message: 'Alamat IP v4 tidak valid' }),
  subnet_mask: z.string().default('255.255.255.0'),
  gateway_address: z.string().ip({ version: 'v4' }).nullable().optional(),
  dns_servers: z.string().max(255).nullable().optional(),
  ip_type: z.enum(['Static', 'DHCP Pool', 'Network Address', 'Broadcast Address']).default('Static'),
  allocation_status: z.enum(['Available', 'Reserved', 'Allocated']).default('Available'),
  computer_id: z.string().uuid().nullable().optional(),
  network_device_id: z.string().uuid().nullable().optional(),
  ip_description: z.string().nullable().optional(),
  created_by: z.string().uuid().nullable().optional(),
});

export const ipAddressUpdateSchema = ipAddressCreateSchema.partial();

export const subnetCreateSchema = z.object({
  subnet_cidr: z.string().min(3, 'Format CIDR tidak valid'), // e.g., '192.168.10.0/24'
  vlan_id: z.string().uuid().nullable().optional(),
  gateway_ip: z.string().ip({ version: 'v4' }).nullable().optional(),
  dns_servers: z.string().max(255).nullable().optional(),
});

export const vlanCreateSchema = z.object({
  vlan_number: z.number().int().min(1).max(4094),
  vlan_name: z.string().min(1, 'Nama VLAN wajib diisi').max(100),
  laboratory_id: z.string().uuid().nullable().optional(),
});

export const dnsRecordCreateSchema = z.object({
  domain_name: z.string().min(1, 'Nama domain wajib diisi').max(255),
  record_type: z.string().max(10),
  record_value: z.string().min(1, 'Value record wajib diisi'),
  ttl: z.number().int().nullable().optional(),
});
