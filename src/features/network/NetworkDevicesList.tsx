import React, { useState } from 'react';
import { useNetworkDevices, useCreateNetworkDevice } from './queries';
import { DataTable, Column } from '../../shared/components/ui/DataTable';
import { Badge } from '../../shared/components/ui/Badge';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { Select } from '../../shared/components/ui/Select';
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';
import { useToast } from '../../shared/components/Toast';
import { Search, Plus, Router, Server, Wifi, Shield, Zap, MonitorSmartphone } from 'lucide-react';

const deviceTypeIcon = (type: string) => {
  const icons: Record<string, React.ReactNode> = {
    'Router': <Router className="w-4 h-4 text-blue-500" />,
    'Switch': <Server className="w-4 h-4 text-emerald-500" />,
    'Access Point': <Wifi className="w-4 h-4 text-violet-500" />,
    'Firewall': <Shield className="w-4 h-4 text-rose-500" />,
    'Server': <Server className="w-4 h-4 text-slate-500" />,
    'UPS': <Zap className="w-4 h-4 text-amber-500" />,
    'ONU': <MonitorSmartphone className="w-4 h-4 text-sky-500" />,
  };
  return icons[type] || <Server className="w-4 h-4 text-slate-400" />;
};

const deviceTypeBadge: Record<string, any> = {
  'Router': 'sky',
  'Switch': 'success',
  'Access Point': 'violet',
  'Firewall': 'danger',
  'Server': 'default',
  'UPS': 'warning',
  'ONU': 'indigo',
};

const conditionBadge: Record<string, any> = {
  'Baik': 'success',
  'Maintenance': 'warning',
  'Rusak Ringan': 'orange' as any,
  'Rusak Berat': 'danger',
};

const statusBadge: Record<string, any> = {
  'Aktif': 'success',
  'Nonaktif': 'default',
  'Cadangan': 'warning',
};

const DEFAULT_ROOM_ID = 'r0000001-0000-0000-0000-000000000001';

export const NetworkDevicesList: React.FC = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState('device_name');
  const [sortAscending, setSortAscending] = useState(true);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    device_name: '',
    device_type: 'Switch' as const,
    brand: '',
    model_name: '',
    serial_number: '',
    room_id: DEFAULT_ROOM_ID,
    condition: 'Baik' as const,
    status: 'Aktif' as const,
    lifecycle_status: 'Active' as const,
  });

  const queryOptions = {
    filters: {
      ...(typeFilter ? { device_type: typeFilter } : {}),
      ...(conditionFilter ? { condition: conditionFilter } : {}),
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    search: search ? { term: search, fields: ['device_name', 'brand', 'model_name', 'serial_number'] } : undefined,
    orderBy: { column: sortColumn, ascending: sortAscending },
    page,
    pageSize,
  };

  const { data, isLoading } = useNetworkDevices(queryOptions);
  const { mutate: createDevice } = useCreateNetworkDevice();

  const devices = data?.data || [];

  // Stats
  const byType: Record<string, number> = {};
  devices.forEach((d: any) => { byType[d.device_type] = (byType[d.device_type] || 0) + 1; });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDevice(addForm, {
      onSuccess: () => {
        toast('success', `Perangkat "${addForm.device_name}" berhasil ditambahkan.`);
        setAddModalOpen(false);
      },
      onError: (err: any) => toast('error', err.message || 'Gagal menambahkan perangkat.'),
    });
  };

  const columns: Column<any>[] = [
    {
      header: 'Perangkat',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
            {deviceTypeIcon(row.device_type)}
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{row.device_name}</p>
            <p className="text-xs text-slate-400">{row.brand} {row.model_name}</p>
          </div>
        </div>
      ),
      sortable: true,
      sortKey: 'device_name',
    },
    {
      header: 'Tipe',
      accessor: (row) => (
        <Badge variant={deviceTypeBadge[row.device_type] || 'default'}>
          {row.device_type}
        </Badge>
      ),
      sortable: true,
      sortKey: 'device_type',
    },
    {
      header: 'Serial Number',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
          {row.serial_number || <span className="italic text-slate-300 dark:text-slate-600">—</span>}
        </span>
      ),
    },
    {
      header: 'Kondisi',
      accessor: (row) => <Badge variant={conditionBadge[row.condition] || 'default'}>{row.condition}</Badge>,
      sortable: true,
      sortKey: 'condition',
    },
    {
      header: 'Status',
      accessor: (row) => <Badge variant={statusBadge[row.status] || 'default'}>{row.status}</Badge>,
      sortable: true,
      sortKey: 'status',
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Perangkat Jaringan
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Router, switch, access point, firewall, dan perangkat infrastruktur jaringan laboratorium.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>
          Tambah Perangkat
        </Button>
      </div>

      {/* TYPE STATS CARDS */}
      <div className="grid grid-cols-4 gap-3">
        {['Router', 'Switch', 'Access Point', 'Firewall'].map((type) => (
          <Card
            key={type}
            className="p-3 flex items-center gap-2.5 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => { setTypeFilter(typeFilter === type ? '' : type); setPage(1); }}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${typeFilter === type ? 'bg-sky-100 dark:bg-sky-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
              {deviceTypeIcon(type)}
            </div>
            <div>
              <p className="text-xs text-slate-500">{type}</p>
              <p className="text-lg font-bold text-slate-800 dark:text-white">{byType[type] || 0}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* FILTER */}
      <Card className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 items-end">
        <Input
          label="Cari Perangkat"
          placeholder="Nama, brand, model, SN..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={<Search className="w-4 h-4" />}
        />
        <Select
          label="Tipe Perangkat"
          options={[
            { value: '', label: 'Semua Tipe' },
            { value: 'Router', label: 'Router' },
            { value: 'Switch', label: 'Switch' },
            { value: 'Access Point', label: 'Access Point' },
            { value: 'Firewall', label: 'Firewall' },
            { value: 'Server', label: 'Server' },
            { value: 'UPS', label: 'UPS' },
            { value: 'ONU', label: 'ONU' },
          ]}
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
        />
        <Select
          label="Kondisi"
          options={[
            { value: '', label: 'Semua Kondisi' },
            { value: 'Baik', label: 'Baik' },
            { value: 'Maintenance', label: 'Maintenance' },
            { value: 'Rusak Ringan', label: 'Rusak Ringan' },
            { value: 'Rusak Berat', label: 'Rusak Berat' },
          ]}
          value={conditionFilter}
          onChange={(e) => { setConditionFilter(e.target.value); setPage(1); }}
        />
        <Select
          label="Status Operasional"
          options={[
            { value: '', label: 'Semua Status' },
            { value: 'Aktif', label: 'Aktif' },
            { value: 'Nonaktif', label: 'Nonaktif' },
            { value: 'Cadangan', label: 'Cadangan' },
          ]}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        />
      </Card>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={devices}
        loading={isLoading}
        emptyTitle="Tidak Ada Perangkat Jaringan"
        emptyDescription="Belum ada perangkat jaringan terdaftar atau tidak ada yang cocok dengan filter."
        page={page}
        pageSize={pageSize}
        totalCount={data?.count || 0}
        onPageChange={setPage}
        sortColumn={sortColumn}
        sortAscending={sortAscending}
        onSortChange={(col, asc) => { setSortColumn(col); setSortAscending(asc); }}
      />

      {/* ADD MODAL */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Tambah Perangkat Jaringan Baru">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nama Perangkat"
              value={addForm.device_name}
              onChange={(e) => setAddForm((p) => ({ ...p, device_name: e.target.value }))}
              placeholder="e.g. SW-CORE-01"
              required
            />
            <Select
              label="Tipe Perangkat"
              options={[
                { value: 'Router', label: 'Router' },
                { value: 'Switch', label: 'Switch' },
                { value: 'Access Point', label: 'Access Point' },
                { value: 'Firewall', label: 'Firewall' },
                { value: 'Server', label: 'Server' },
                { value: 'UPS', label: 'UPS' },
                { value: 'ONU', label: 'ONU' },
              ]}
              value={addForm.device_type}
              onChange={(e) => setAddForm((p) => ({ ...p, device_type: e.target.value as any }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Merek"
              value={addForm.brand}
              onChange={(e) => setAddForm((p) => ({ ...p, brand: e.target.value }))}
              placeholder="e.g. Cisco, Mikrotik, Ubiquiti"
              required
            />
            <Input
              label="Model"
              value={addForm.model_name}
              onChange={(e) => setAddForm((p) => ({ ...p, model_name: e.target.value }))}
              placeholder="e.g. Catalyst 2960"
              required
            />
          </div>
          <Input
            label="Serial Number (opsional)"
            value={addForm.serial_number}
            onChange={(e) => setAddForm((p) => ({ ...p, serial_number: e.target.value }))}
            placeholder="e.g. FOC1234X5678"
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Kondisi"
              options={[
                { value: 'Baik', label: 'Baik' },
                { value: 'Maintenance', label: 'Maintenance' },
                { value: 'Rusak Ringan', label: 'Rusak Ringan' },
                { value: 'Rusak Berat', label: 'Rusak Berat' },
              ]}
              value={addForm.condition}
              onChange={(e) => setAddForm((p) => ({ ...p, condition: e.target.value as any }))}
            />
            <Select
              label="Status"
              options={[
                { value: 'Aktif', label: 'Aktif' },
                { value: 'Nonaktif', label: 'Nonaktif' },
                { value: 'Cadangan', label: 'Cadangan' },
              ]}
              value={addForm.status}
              onChange={(e) => setAddForm((p) => ({ ...p, status: e.target.value as any }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary">Simpan Perangkat</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NetworkDevicesList;
