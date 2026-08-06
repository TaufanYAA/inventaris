import React, { useState } from 'react';
import { useIncidents, usePromoteTicket } from './queries';
import { DataTable, Column } from '../../shared/components/ui/DataTable';
import { Badge } from '../../shared/components/ui/Badge';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { Select } from '../../shared/components/ui/Select';
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';
import { useToast } from '../../shared/components/Toast';
import { Search, Plus, ShieldAlert, ShieldCheck, AlertTriangle, Flame } from 'lucide-react';

const severityConfig: Record<string, { badge: any; icon: React.ReactNode; label: string }> = {
  'Low': { badge: 'success', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, label: 'Low' },
  'Medium': { badge: 'warning', icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, label: 'Medium' },
  'High': { badge: 'orange' as any, icon: <ShieldAlert className="w-4 h-4 text-orange-500" />, label: 'High' },
  'Critical': { badge: 'danger', icon: <Flame className="w-4 h-4 text-rose-500" />, label: 'Critical' },
};

const statusBadge = (status: string) => {
  const map: Record<string, any> = {
    'Open': 'warning',
    'Investigating': 'sky',
    'Workaround': 'indigo',
    'Resolved': 'success',
    'Closed': 'default',
    'Escalated': 'danger',
  };
  return <Badge variant={map[status] || 'default'}>{status}</Badge>;
};

export const IncidentsList: React.FC = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const { mutate: promoteTicket } = usePromoteTicket();

  const [addForm, setAddForm] = useState({
    incident_title: '',
    incident_description: '',
    severity: 'Medium' as const,
    incident_status: 'Open' as const,
  });

  const filters: Record<string, any> = {};
  if (severityFilter) filters.severity = severityFilter;
  if (statusFilter) filters.incident_status = statusFilter;

  const { data: incidentsData, isLoading } = useIncidents(filters);

  const incidents = Array.isArray(incidentsData) ? incidentsData : [];

  const filtered = search
    ? incidents.filter((i: any) =>
        i.incident_number?.toLowerCase().includes(search.toLowerCase()) ||
        i.incident_title?.toLowerCase().includes(search.toLowerCase()) ||
        i.incident_description?.toLowerCase().includes(search.toLowerCase())
      )
    : incidents;

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    promoteTicket({
      incidentData: addForm,
      newTicketStatus: 'Escalated',
    }, {
      onSuccess: () => {
        toast('success', 'Insiden baru berhasil dibuat.');
        setAddModalOpen(false);
        setAddForm({ incident_title: '', incident_description: '', severity: 'Medium', incident_status: 'Open' });
      },
      onError: (err: any) => toast('error', err.message || 'Gagal membuat insiden.'),
    });
  };

  // Stats
  const criticalCount = incidents.filter((i: any) => i.severity === 'Critical').length;
  const highCount = incidents.filter((i: any) => i.severity === 'High').length;
  const openCount = incidents.filter((i: any) => i.incident_status === 'Open' || i.incident_status === 'Investigating').length;

  const columns: Column<any>[] = [
    {
      header: 'No. Insiden',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold text-rose-600 dark:text-rose-400">
          {row.incident_number || `#${String(row.id).slice(0, 8).toUpperCase()}`}
        </span>
      ),
    },
    {
      header: 'Severity',
      accessor: (row) => {
        const cfg = severityConfig[row.severity] || severityConfig['Medium'];
        return (
          <div className="flex items-center gap-1.5">
            {cfg.icon}
            <Badge variant={cfg.badge}>{cfg.label}</Badge>
          </div>
        );
      },
    },
    {
      header: 'Judul Insiden',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 leading-snug">{row.incident_title}</p>
          <p className="text-xs text-slate-400 truncate max-w-xs mt-0.5" title={row.incident_description}>
            {row.incident_description}
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => statusBadge(row.incident_status),
    },
    {
      header: 'Tgl. Dibuat',
      accessor: (row) => (
        <span className="text-sm text-slate-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      header: 'Diselesaikan',
      accessor: (row) => (
        <span className="text-sm text-slate-500">
          {row.resolved_at
            ? new Date(row.resolved_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
            : <span className="text-slate-300 dark:text-slate-600 italic text-xs">Belum resolved</span>}
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
            Insiden Sistem &amp; Hardware
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pelacakan insiden mayor ketersediaan sistem jaringan dan laboratorium.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setAddModalOpen(true)}
        >
          Laporkan Insiden
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3 border-l-4 border-rose-500">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <Flame className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Critical</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{criticalCount}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-l-4 border-orange-400">
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
            <ShieldAlert className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">High</p>
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{highCount}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3 border-l-4 border-amber-400">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Open / Investigating</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{openCount}</p>
          </div>
        </Card>
      </div>

      {/* FILTER */}
      <Card className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 items-end">
        <Input
          label="Cari Insiden"
          placeholder="Cari no. insiden, judul..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={<Search className="w-4 h-4" />}
        />
        <Select
          label="Filter Severity"
          options={[
            { value: '', label: 'Semua Severity' },
            { value: 'Low', label: '🟢 Low' },
            { value: 'Medium', label: '🟡 Medium' },
            { value: 'High', label: '🟠 High' },
            { value: 'Critical', label: '🔴 Critical' },
          ]}
          value={severityFilter}
          onChange={(e) => { setSeverityFilter(e.target.value); setPage(1); }}
        />
        <Select
          label="Filter Status"
          options={[
            { value: '', label: 'Semua Status' },
            { value: 'Open', label: 'Open' },
            { value: 'Investigating', label: 'Investigating' },
            { value: 'Workaround', label: 'Workaround' },
            { value: 'Resolved', label: 'Resolved' },
            { value: 'Closed', label: 'Closed' },
          ]}
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        />
      </Card>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={paged}
        loading={isLoading}
        emptyTitle="Tidak Ada Insiden"
        emptyDescription="Belum ada insiden terdaftar. Sistem berjalan normal."
        page={page}
        pageSize={pageSize}
        totalCount={filtered.length}
        onPageChange={setPage}
      />

      {/* ADD MODAL */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Laporkan Insiden Baru">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            Insiden adalah masalah teknis serius yang berdampak luas pada layanan atau infrastruktur.
          </div>
          <Input
            label="Judul Insiden"
            value={addForm.incident_title}
            onChange={(e) => setAddForm((prev) => ({ ...prev, incident_title: e.target.value }))}
            placeholder="Judul singkat dan deskriptif..."
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi Insiden</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              rows={3}
              placeholder="Deskripsi teknis lengkap tentang insiden ini..."
              value={addForm.incident_description}
              onChange={(e) => setAddForm((prev) => ({ ...prev, incident_description: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tingkat Keparahan (Severity)"
              options={[
                { value: 'Low', label: '🟢 Low' },
                { value: 'Medium', label: '🟡 Medium' },
                { value: 'High', label: '🟠 High' },
                { value: 'Critical', label: '🔴 Critical' },
              ]}
              value={addForm.severity}
              onChange={(e) => setAddForm((prev) => ({ ...prev, severity: e.target.value as any }))}
            />
            <Select
              label="Status Awal"
              options={[
                { value: 'Open', label: 'Open' },
                { value: 'Investigating', label: 'Investigating' },
              ]}
              value={addForm.incident_status}
              onChange={(e) => setAddForm((prev) => ({ ...prev, incident_status: e.target.value as any }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" icon={<ShieldAlert className="w-4 h-4" />}>Laporkan Insiden</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IncidentsList;
