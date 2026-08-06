import React, { useState } from 'react';
import { useIpPool, useAllocateIp } from './queries';
import { DataTable, Column } from '../../shared/components/ui/DataTable';
import { Badge } from '../../shared/components/ui/Badge';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { Select } from '../../shared/components/ui/Select';
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';
import { useToast } from '../../shared/components/Toast';
import { Search, Plus, Network, Globe, Lock, CheckCircle2 } from 'lucide-react';

const allocationBadge: Record<string, any> = {
  'Available': 'success',
  'Allocated': 'sky',
  'Reserved': 'warning',
};

const ipTypeBadge: Record<string, any> = {
  'Static': 'default',
  'DHCP Pool': 'indigo',
  'Network Address': 'violet',
  'Broadcast Address': 'orange' as any,
};

export const IpamList: React.FC = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [allocationFilter, setAllocationFilter] = useState('');
  const [ipTypeFilter, setIpTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    ip_address: '',
    subnet_mask: '255.255.255.0',
    gateway_address: '',
    dns_servers: '8.8.8.8, 1.1.1.1',
    ip_type: 'Static' as const,
    allocation_status: 'Available' as const,
    ip_description: '',
  });

  const filters: Record<string, any> = {};
  if (allocationFilter) filters.allocation_status = allocationFilter;
  if (ipTypeFilter) filters.ip_type = ipTypeFilter;

  const { data, isLoading } = useIpPool(filters);
  const { mutate: allocateIp } = useAllocateIp();

  const allIps = data?.data || [];

  // Client-side search
  const filtered = search
    ? allIps.filter((ip: any) =>
        ip.ip_address?.includes(search) ||
        ip.ip_description?.toLowerCase().includes(search.toLowerCase())
      )
    : allIps;

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  // Stats
  const availableCount = allIps.filter((ip: any) => ip.allocation_status === 'Available').length;
  const allocatedCount = allIps.filter((ip: any) => ip.allocation_status === 'Allocated').length;
  const reservedCount = allIps.filter((ip: any) => ip.allocation_status === 'Reserved').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    allocateIp({
      ...addForm,
      gateway_address: addForm.gateway_address || null,
    }, {
      onSuccess: () => {
        toast('success', `IP ${addForm.ip_address} berhasil dialokasikan.`);
        setAddModalOpen(false);
        setAddForm({ ip_address: '', subnet_mask: '255.255.255.0', gateway_address: '', dns_servers: '8.8.8.8, 1.1.1.1', ip_type: 'Static', allocation_status: 'Available', ip_description: '' });
      },
      onError: (err: any) => toast('error', err.message || 'Gagal mengalokasikan IP.'),
    });
  };

  const columns: Column<any>[] = [
    {
      header: 'Alamat IP',
      accessor: (row) => (
        <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">
          {row.ip_address}
        </span>
      ),
    },
    {
      header: 'Subnet Mask',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {row.subnet_mask || '—'}
        </span>
      ),
    },
    {
      header: 'Tipe IP',
      accessor: (row) => <Badge variant={ipTypeBadge[row.ip_type] || 'default'}>{row.ip_type}</Badge>,
    },
    {
      header: 'Status Alokasi',
      accessor: (row) => <Badge variant={allocationBadge[row.allocation_status] || 'default'}>{row.allocation_status}</Badge>,
    },
    {
      header: 'Perangkat Terhubung',
      accessor: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.computer?.computer_name || row.network_device?.device_name || (
            <span className="text-slate-300 dark:text-slate-600 italic text-xs">Tidak ada</span>
          )}
        </span>
      ),
    },
    {
      header: 'Deskripsi',
      accessor: (row) => (
        <span className="text-xs text-slate-500 truncate max-w-[150px]" title={row.ip_description}>
          {row.ip_description || <span className="italic text-slate-300 dark:text-slate-600">—</span>}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            IPAM — Manajemen Alamat IP
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pelacakan alokasi dan ketersediaan alamat IP dalam infrastruktur jaringan laboratorium.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>
          Tambah IP
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Available</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{availableCount}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
            <Globe className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Allocated</p>
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{allocatedCount}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Lock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Reserved</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{reservedCount}</p>
          </div>
        </Card>
      </div>

      {/* UTILIZATION BAR */}
      {allIps.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Utilisasi IP Pool</span>
            <span className="text-sm text-slate-500">{allocatedCount + reservedCount} / {allIps.length} terpakai</span>
          </div>
          <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-sky-500 transition-all duration-500"
              style={{ width: `${(allocatedCount / allIps.length) * 100}%` }}
            />
            <div
              className="h-full bg-amber-400 transition-all duration-500"
              style={{ width: `${(reservedCount / allIps.length) * 100}%` }}
            />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />Allocated</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Reserved</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Available</span>
          </div>
        </Card>
      )}

      {/* FILTER */}
      <Card className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 items-end">
        <Input
          label="Cari IP / Deskripsi"
          placeholder="192.168.x.x atau nama..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={<Search className="w-4 h-4" />}
        />
        <Select
          label="Status Alokasi"
          options={[
            { value: '', label: 'Semua Status' },
            { value: 'Available', label: 'Available' },
            { value: 'Allocated', label: 'Allocated' },
            { value: 'Reserved', label: 'Reserved' },
          ]}
          value={allocationFilter}
          onChange={(e) => { setAllocationFilter(e.target.value); setPage(1); }}
        />
        <Select
          label="Tipe IP"
          options={[
            { value: '', label: 'Semua Tipe' },
            { value: 'Static', label: 'Static' },
            { value: 'DHCP Pool', label: 'DHCP Pool' },
            { value: 'Network Address', label: 'Network Address' },
            { value: 'Broadcast Address', label: 'Broadcast Address' },
          ]}
          value={ipTypeFilter}
          onChange={(e) => { setIpTypeFilter(e.target.value); setPage(1); }}
        />
      </Card>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={paged}
        loading={isLoading}
        emptyTitle="Tidak Ada Alamat IP"
        emptyDescription="Belum ada alamat IP terdaftar dalam database."
        page={page}
        pageSize={pageSize}
        totalCount={filtered.length}
        onPageChange={setPage}
      />

      {/* ADD MODAL */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Tambah Alamat IP Baru">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Alamat IP"
              value={addForm.ip_address}
              onChange={(e) => setAddForm((p) => ({ ...p, ip_address: e.target.value }))}
              placeholder="192.168.1.100"
              required
            />
            <Input
              label="Subnet Mask"
              value={addForm.subnet_mask}
              onChange={(e) => setAddForm((p) => ({ ...p, subnet_mask: e.target.value }))}
              placeholder="255.255.255.0"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Gateway (opsional)"
              value={addForm.gateway_address}
              onChange={(e) => setAddForm((p) => ({ ...p, gateway_address: e.target.value }))}
              placeholder="192.168.1.1"
            />
            <Input
              label="DNS Servers"
              value={addForm.dns_servers}
              onChange={(e) => setAddForm((p) => ({ ...p, dns_servers: e.target.value }))}
              placeholder="8.8.8.8, 1.1.1.1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipe IP"
              options={[
                { value: 'Static', label: 'Static' },
                { value: 'DHCP Pool', label: 'DHCP Pool' },
                { value: 'Network Address', label: 'Network Address' },
                { value: 'Broadcast Address', label: 'Broadcast Address' },
              ]}
              value={addForm.ip_type}
              onChange={(e) => setAddForm((p) => ({ ...p, ip_type: e.target.value as any }))}
            />
            <Select
              label="Status Alokasi"
              options={[
                { value: 'Available', label: 'Available' },
                { value: 'Allocated', label: 'Allocated' },
                { value: 'Reserved', label: 'Reserved' },
              ]}
              value={addForm.allocation_status}
              onChange={(e) => setAddForm((p) => ({ ...p, allocation_status: e.target.value as any }))}
            />
          </div>
          <Input
            label="Deskripsi (opsional)"
            value={addForm.ip_description}
            onChange={(e) => setAddForm((p) => ({ ...p, ip_description: e.target.value }))}
            placeholder="e.g. IP untuk PC Lab-A-01"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" icon={<Network className="w-4 h-4" />}>Alokasikan IP</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IpamList;
