import React, { useState } from 'react';
import { useMaintenanceJobs, useCreateMaintenanceJob, useUpdateMaintenanceJob, useResolveJob } from './queries';
import { DataTable, Column } from '../../shared/components/ui/DataTable';
import { Badge } from '../../shared/components/ui/Badge';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { Select } from '../../shared/components/ui/Select';
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';
import { useToast } from '../../shared/components/Toast';
import { Search, Plus, Wrench, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

const statusBadge = (status: string) => {
  const map: Record<string, any> = {
    'Pending': 'warning',
    'In Progress': 'sky',
    'Resolved': 'success',
    'Cancelled': 'danger',
  };
  return <Badge variant={map[status] || 'default'}>{status}</Badge>;
};

const TECHNICIAN_ID = 'u0000001-0000-0000-0000-000000000001';

export const MaintenanceJobsList: React.FC = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortColumn, setSortColumn] = useState('scheduled_date');
  const [sortAscending, setSortAscending] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [resolveModal, setResolveModal] = useState<{ open: boolean; jobId: string; jobTitle: string }>({ open: false, jobId: '', jobTitle: '' });

  const [addForm, setAddForm] = useState({
    technician_id: TECHNICIAN_ID,
    ticket_title: '',
    maintenance_status: 'Pending' as const,
    scheduled_date: new Date().toISOString().split('T')[0],
    computer_id: null as string | null,
    network_device_id: null as string | null,
  });

  const [resolveForm, setResolveForm] = useState({
    action_taken: '',
    spareparts_replaced: '',
    maintenance_cost: 0,
  });

  const queryOptions = {
    filters: { ...(statusFilter ? { maintenance_status: statusFilter } : {}) },
    search: search ? { term: search, fields: ['ticket_title'] } : undefined,
    orderBy: { column: sortColumn, ascending: sortAscending },
    page,
    pageSize,
  };

  const { data, isLoading } = useMaintenanceJobs(queryOptions);
  const { mutate: createJob } = useCreateMaintenanceJob();
  const { mutate: resolveJob } = useResolveJob();

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJob(addForm, {
      onSuccess: () => {
        toast('success', `Pekerjaan "${addForm.ticket_title}" berhasil dibuat.`);
        setAddModalOpen(false);
        setAddForm({ technician_id: TECHNICIAN_ID, ticket_title: '', maintenance_status: 'Pending', scheduled_date: new Date().toISOString().split('T')[0], computer_id: null, network_device_id: null });
      },
      onError: (err: any) => toast('error', err.message || 'Gagal membuat pekerjaan.'),
    });
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resolveJob({
      maintenanceId: resolveModal.jobId,
      detailData: resolveForm,
      targetAsset: null,
    }, {
      onSuccess: () => {
        toast('success', `Pekerjaan "${resolveModal.jobTitle}" berhasil diselesaikan.`);
        setResolveModal({ open: false, jobId: '', jobTitle: '' });
        setResolveForm({ action_taken: '', spareparts_replaced: '', maintenance_cost: 0 });
      },
      onError: (err: any) => toast('error', err.message || 'Gagal menyelesaikan pekerjaan.'),
    });
  };

  const columns: Column<any>[] = [
    {
      header: 'No. Pekerjaan',
      accessor: (row) => (
        <span className="font-mono text-xs font-semibold text-sky-600 dark:text-sky-400">
          #{String(row.id).slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      header: 'Judul Pekerjaan',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Wrench className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <span className="font-medium text-slate-800 dark:text-slate-100 text-sm">{row.ticket_title}</span>
        </div>
      ),
      sortable: true,
      sortKey: 'ticket_title',
    },
    {
      header: 'Status',
      accessor: (row) => statusBadge(row.maintenance_status),
      sortable: true,
      sortKey: 'maintenance_status',
    },
    {
      header: 'Tgl. Dijadwalkan',
      accessor: (row) => (
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {row.scheduled_date ? new Date(row.scheduled_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
        </span>
      ),
      sortable: true,
      sortKey: 'scheduled_date',
    },
    {
      header: 'Tgl. Selesai',
      accessor: (row) => (
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {row.completion_date ? new Date(row.completion_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : <span className="text-slate-300 dark:text-slate-600 italic text-xs">Belum selesai</span>}
        </span>
      ),
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        <div className="flex items-center gap-1.5">
          {row.maintenance_status === 'Pending' || row.maintenance_status === 'In Progress' ? (
            <Button
              variant="outline"
              size="sm"
              icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
              onClick={() => setResolveModal({ open: true, jobId: row.id, jobTitle: row.ticket_title })}
            >
              Selesaikan
            </Button>
          ) : (
            <span className="text-xs text-slate-400 dark:text-slate-600 italic">—</span>
          )}
        </div>
      ),
    },
  ];

  // Stats summary
  const jobs = data?.data || [];
  const pendingCount = jobs.filter((j: any) => j.maintenance_status === 'Pending').length;
  const inProgressCount = jobs.filter((j: any) => j.maintenance_status === 'In Progress').length;
  const resolvedCount = jobs.filter((j: any) => j.maintenance_status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Penugasan Perbaikan
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manajemen pekerjaan pemeliharaan teknis workstation dan infrastruktur jaringan.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setAddModalOpen(true)}
        >
          Tambah Pekerjaan
        </Button>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pending</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{pendingCount}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-900/30 flex items-center justify-center">
            <Wrench className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Sedang Dikerjakan</p>
            <p className="text-2xl font-bold text-sky-600 dark:text-sky-400">{inProgressCount}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Selesai</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{resolvedCount}</p>
          </div>
        </Card>
      </div>

      {/* FILTER */}
      <Card className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 items-end">
        <Input
          label="Cari Pekerjaan"
          placeholder="Cari judul pekerjaan..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={<Search className="w-4 h-4" />}
        />
        <Select
          label="Filter Status"
          options={[
            { value: '', label: 'Semua Status' },
            { value: 'Pending', label: 'Pending' },
            { value: 'In Progress', label: 'In Progress' },
            { value: 'Resolved', label: 'Resolved' },
            { value: 'Cancelled', label: 'Cancelled' },
          ]}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        />
      </Card>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={jobs}
        loading={isLoading}
        emptyTitle="Tidak Ada Pekerjaan"
        emptyDescription="Belum ada penugasan perbaikan atau semua pekerjaan sudah selesai."
        page={page}
        pageSize={pageSize}
        totalCount={data?.count || 0}
        onPageChange={setPage}
        sortColumn={sortColumn}
        sortAscending={sortAscending}
        onSortChange={(col, asc) => { setSortColumn(col); setSortAscending(asc); }}
      />

      {/* ADD MODAL */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Tambah Pekerjaan Pemeliharaan">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Judul Pekerjaan"
            value={addForm.ticket_title}
            onChange={(e) => setAddForm((prev) => ({ ...prev, ticket_title: e.target.value }))}
            placeholder="e.g. Ganti thermal paste PC-12"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Status Awal"
              options={[
                { value: 'Pending', label: 'Pending' },
                { value: 'In Progress', label: 'In Progress' },
              ]}
              value={addForm.maintenance_status}
              onChange={(e) => setAddForm((prev) => ({ ...prev, maintenance_status: e.target.value as any }))}
            />
            <Input
              label="Tanggal Dijadwalkan"
              type="date"
              value={addForm.scheduled_date}
              onChange={(e) => setAddForm((prev) => ({ ...prev, scheduled_date: e.target.value }))}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary">Simpan Pekerjaan</Button>
          </div>
        </form>
      </Modal>

      {/* RESOLVE MODAL */}
      <Modal isOpen={resolveModal.open} onClose={() => setResolveModal({ open: false, jobId: '', jobTitle: '' })} title={`Selesaikan: ${resolveModal.jobTitle}`}>
        <form onSubmit={handleResolveSubmit} className="space-y-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-sm text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            Isi laporan penyelesaian sebelum menandai pekerjaan sebagai Resolved.
          </div>
          <Input
            label="Tindakan yang Diambil"
            value={resolveForm.action_taken}
            onChange={(e) => setResolveForm((prev) => ({ ...prev, action_taken: e.target.value }))}
            placeholder="Jelaskan tindakan yang dilakukan..."
            required
          />
          <Input
            label="Sparepart Diganti (opsional)"
            value={resolveForm.spareparts_replaced}
            onChange={(e) => setResolveForm((prev) => ({ ...prev, spareparts_replaced: e.target.value }))}
            placeholder="e.g. Thermal paste Noctua NT-H1"
          />
          <Input
            label="Biaya Perbaikan (Rp)"
            type="number"
            value={resolveForm.maintenance_cost.toString()}
            onChange={(e) => setResolveForm((prev) => ({ ...prev, maintenance_cost: Number(e.target.value) }))}
            placeholder="0"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setResolveModal({ open: false, jobId: '', jobTitle: '' })}>Batal</Button>
            <Button type="submit" variant="primary" icon={<CheckCircle2 className="w-4 h-4" />}>Tandai Selesai</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default MaintenanceJobsList;
