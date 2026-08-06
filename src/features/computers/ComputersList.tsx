import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useComputers, useCreateComputer } from './queries';
import { DataTable, Column } from '../../shared/components/ui/DataTable';
import { Badge } from '../../shared/components/ui/Badge';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { Select } from '../../shared/components/ui/Select';
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';
import { useToast } from '../../shared/components/Toast';
import { Search, Filter, Plus, FileSpreadsheet, QrCode, Cpu, ShieldCheck } from 'lucide-react';
import { Database } from '../../types/database.types';

type ComputerRow = Database['public']['Tables']['computers']['Row'];

export const ComputersList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // States for search and filter options
  const [search, setSearch] = useState('');
  const [labFilter, setLabFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [osFilter, setOsFilter] = useState('');
  
  // DataTable pagination & sorting state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState('computer_name');
  const [sortAscending, setSortAscending] = useState(true);

  // QR scan simulator state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrSelectedPC, setQrSelectedPC] = useState('');

  // New computer form modal state
  const [newPCModalOpen, setNewPCModalOpen] = useState(false);
  const [newPCForm, setNewPCForm] = useState({
    computer_name: '',
    laboratory_id: 'c1111111-1111-1111-1111-111111111111', // default Lab A uuid
    operating_system: 'Windows 11' as any,
    processor: 'AMD Ryzen 5 5600X',
    motherboard: 'Asus Prime H610M-K',
    ram: '8GB DDR4',
    storage: 'Samsung 980 512GB NVMe M.2 SSD',
    gpu: 'Intel UHD Graphics 730',
    monitor_brand: 'LG Electronics',
    monitor_model: 'UltraGear 24GQ50F',
    monitor_serial: 'SN-NEW-MONITOR',
    peripheral_details: 'Logitech K120 Keyboard + B100 Mouse',
    condition: 'Baik' as any,
    status: 'Aktif' as any,
    lifecycle_status: 'Installed' as any,
  });

  const queryOptions = {
    filters: {
      ...(labFilter ? { laboratory_id: labFilter } : {}),
      ...(conditionFilter ? { condition: conditionFilter } : {}),
      ...(osFilter ? { operating_system: osFilter } : {}),
    },
    search: search ? { term: search, fields: ['computer_name', 'processor', 'ram', 'storage', 'gpu'] } : undefined,
    orderBy: { column: sortColumn, ascending: sortAscending },
    page,
    pageSize,
  };

  const { data, isLoading } = useComputers(queryOptions);
  const { mutate: createComputer } = useCreateComputer();

  const handleSortChange = (column: string, ascending: boolean) => {
    setSortColumn(column);
    setSortAscending(ascending);
  };

  // Mock CSV exporter
  const handleExportCSV = () => {
    if (!data?.data || data.data.length === 0) {
      toast('warning', 'Tidak ada data untuk diekspor.');
      return;
    }

    const headers = ['Computer Name', 'OS', 'Processor', 'RAM', 'Storage', 'GPU', 'Condition', 'Status', 'Lifecycle'];
    const rows = data.data.map(pc => [
      pc.computer_name,
      pc.operating_system,
      pc.processor || '',
      pc.ram || '',
      pc.storage || '',
      pc.gpu || '',
      pc.condition,
      pc.status,
      pc.lifecycle_status,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventaris_pc_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast('success', 'Data inventaris komputer berhasil diekspor ke CSV.');
  };

  // Simulated QR scan action
  const handleSimulateQRScan = () => {
    if (!qrSelectedPC) {
      toast('warning', 'Pilih komputer demo terlebih dahulu.');
      return;
    }

    toast('success', `QR Code PC ${qrSelectedPC} berhasil dipindai.`);
    setQrModalOpen(false);

    // Redirect to detail page of the selected computer
    // Search inside data list to retrieve PC uuid, fallback if not found
    const targetPC = data?.data?.find(pc => pc.computer_name === qrSelectedPC);
    const targetId = targetPC?.id || 'demo-pc-uuid-fallback';
    navigate(`/computers/${targetId}`);
  };

  const handleCreatePCSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createComputer(newPCForm, {
      onSuccess: () => {
        toast('success', `Berhasil menambahkan komputer baru ${newPCForm.computer_name}`);
        setNewPCModalOpen(false);
      },
      onError: (err: any) => {
        toast('error', err.message || 'Gagal menambahkan komputer.');
      }
    });
  };

  // Define Columns configuration for reusable DataTable component
  const columns: Column<ComputerRow>[] = [
    {
      header: 'Nama Komputer',
      accessor: (row) => (
        <button
          onClick={() => navigate(`/computers/${row.id}`)}
          className="text-sky-500 hover:text-sky-600 font-bold tracking-wide transition-colors"
        >
          {row.computer_name}
        </button>
      ),
      sortable: true,
      sortKey: 'computer_name',
    },
    {
      header: 'Laboratorium',
      accessor: (row) => (
        <Badge variant={row.laboratory_id.startsWith('c1') ? 'indigo' : 'violet'}>
          {row.laboratory_id.startsWith('c1') ? 'Lab Pemrograman (A)' : 'Lab Jaringan (B)'}
        </Badge>
      ),
    },
    {
      header: 'Spesifikasi Utama (Processor / RAM / SSD)',
      accessor: (row) => (
        <div className="flex flex-col gap-0.5 text-xs text-slate-500">
          <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
            {row.processor || '-'}
          </span>
          <span>RAM: {row.ram || '-'} • SSD: {row.storage || '-'}</span>
        </div>
      ),
    },
    {
      header: 'Sistem Operasi',
      accessor: 'operating_system',
      sortable: true,
      sortKey: 'operating_system',
    },
    {
      header: 'Kondisi',
      accessor: (row) => <Badge>{row.condition}</Badge>,
      sortable: true,
      sortKey: 'condition',
    },
    {
      header: 'Status',
      accessor: (row) => <Badge>{row.status}</Badge>,
      sortable: true,
      sortKey: 'status',
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Inventaris Komputer (Workstations)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Daftar terperinci 45 unit spesifikasi hybrid PC dan status laboratorium.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button variant="outline" size="sm" icon={<QrCode className="w-4 h-4" />} onClick={() => setQrModalOpen(true)}>
            Scan QR Aset
          </Button>
          <Button variant="outline" size="sm" icon={<FileSpreadsheet className="w-4 h-4" />} onClick={handleExportCSV}>
            Ekspor CSV
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setNewPCModalOpen(true)}>
            Tambah PC
          </Button>
        </div>
      </div>

      {/* FILTER PANEL */}
      <Card className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 items-end">
        <Input
          label="Pencarian Global"
          placeholder="Cari PC, processor, RAM, SSD..."
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          icon={<Search className="w-4 h-4" />}
        />
        <Select
          label="Filter Laboratorium"
          options={[
            { value: '', label: 'Semua Laboratorium' },
            { value: 'c1111111-1111-1111-1111-111111111111', label: 'Lab A (Pemrograman)' },
            { value: 'c2222222-2222-2222-2222-222222222222', label: 'Lab B (Jaringan)' },
          ]}
          value={labFilter}
          onChange={e => {
            setLabFilter(e.target.value);
            setPage(1);
          }}
        />
        <Select
          label="Filter Kondisi"
          options={[
            { value: '', label: 'Semua Kondisi' },
            { value: 'Baik', label: 'Baik' },
            { value: 'Maintenance', label: 'Maintenance' },
            { value: 'Rusak Ringan', label: 'Rusak Ringan' },
            { value: 'Rusak Berat', label: 'Rusak Berat' },
          ]}
          value={conditionFilter}
          onChange={e => {
            setConditionFilter(e.target.value);
            setPage(1);
          }}
        />
        <Select
          label="Sistem Operasi"
          options={[
            { value: '', label: 'Semua OS' },
            { value: 'Windows 11', label: 'Windows 11' },
            { value: 'Windows 10', label: 'Windows 10' },
            { value: 'Ubuntu', label: 'Ubuntu' },
            { value: 'Debian', label: 'Debian' },
          ]}
          value={osFilter}
          onChange={e => {
            setOsFilter(e.target.value);
            setPage(1);
          }}
        />
      </Card>

      {/* COMPUTERS DATATABLE */}
      <DataTable
        columns={columns}
        data={data?.data || []}
        loading={isLoading}
        emptyTitle="Tidak Ada Komputer"
        emptyDescription="Kriteria pencarian komputer tidak ditemukan atau inventaris belum diisi."
        page={page}
        pageSize={pageSize}
        totalCount={data?.count || 0}
        onPageChange={setPage}
        sortColumn={sortColumn}
        sortAscending={sortAscending}
        onSortChange={handleSortChange}
      />

      {/* QR SCANNER SIMULATOR MODAL */}
      <Modal
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Simulator Scanner QR Code Aset"
      >
        <div className="space-y-6 text-center">
          {/* Simulated scan viewfinder overlay */}
          <div className="relative w-48 h-48 mx-auto border-4 border-dashed border-sky-500 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-950/60 overflow-hidden">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-rose-500 animate-pulse"></div>
            <QrCode className="w-20 h-20 text-slate-300 dark:text-slate-800 animate-pulse" />
          </div>
          
          <div className="space-y-3 max-w-sm mx-auto text-left">
            <Select
              label="Pilih Komputer Target Pemindaian"
              options={[
                { value: '', label: 'Pilih PC...' },
                ...Array.from({ length: 45 }, (_, idx) => {
                  const val = `PC-${(idx + 1).toString().padStart(2, '0')}`;
                  return { value: val, label: val };
                })
              ]}
              value={qrSelectedPC}
              onChange={e => setQrSelectedPC(e.target.value)}
            />

            <Button variant="primary" className="w-full" onClick={handleSimulateQRScan}>
              Simulasikan Pemindaian Aset
            </Button>
          </div>
        </div>
      </Modal>

      {/* ADD NEW COMPUTER MODAL FORM */}
      <Modal
        isOpen={newPCModalOpen}
        onClose={() => setNewPCModalOpen(false)}
        title="Tambah Komputer Workstation Baru"
      >
        <form onSubmit={handleCreatePCSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nama Komputer"
              value={newPCForm.computer_name}
              onChange={e => setNewPCForm(prev => ({ ...prev, computer_name: e.target.value }))}
              placeholder="e.g. PC-46"
              required
            />
            <Select
              label="Laboratorium Penempatan"
              options={[
                { value: 'c1111111-1111-1111-1111-111111111111', label: 'Lab A (Pemrograman)' },
                { value: 'c2222222-2222-2222-2222-222222222222', label: 'Lab B (Jaringan)' },
              ]}
              value={newPCForm.laboratory_id}
              onChange={e => setNewPCForm(prev => ({ ...prev, laboratory_id: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Sistem Operasi"
              options={[
                { value: 'Windows 11', label: 'Windows 11' },
                { value: 'Windows 10', label: 'Windows 10' },
                { value: 'Ubuntu', label: 'Ubuntu' },
                { value: 'Debian', label: 'Debian' },
              ]}
              value={newPCForm.operating_system}
              onChange={e => setNewPCForm(prev => ({ ...prev, operating_system: e.target.value as any }))}
            />
            <Input
              label="Processor CPU"
              value={newPCForm.processor}
              onChange={e => setNewPCForm(prev => ({ ...prev, processor: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="RAM Memory"
              value={newPCForm.ram}
              onChange={e => setNewPCForm(prev => ({ ...prev, ram: e.target.value }))}
            />
            <Input
              label="Storage SSD"
              value={newPCForm.storage}
              onChange={e => setNewPCForm(prev => ({ ...prev, storage: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kartu Grafis GPU"
              value={newPCForm.gpu}
              onChange={e => setNewPCForm(prev => ({ ...prev, gpu: e.target.value }))}
            />
            <Input
              label="Model Monitor"
              value={newPCForm.monitor_model}
              onChange={e => setNewPCForm(prev => ({ ...prev, monitor_model: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setNewPCModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Komputer
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default ComputersList;
