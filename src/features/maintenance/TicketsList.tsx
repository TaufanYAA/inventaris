import React, { useState } from 'react';
import { useTickets, useCreateTicket, usePromoteTicket } from './queries';
import { DataTable, Column } from '../../shared/components/ui/DataTable';
import { Badge } from '../../shared/components/ui/Badge';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { Select } from '../../shared/components/ui/Select';
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';
import { useToast } from '../../shared/components/Toast';
import { Search, Plus, Ticket, ArrowUpCircle, AlertOctagon } from 'lucide-react';

const statusBadge = (status: string) => {
  const map: Record<string, any> = {
    'Open': 'warning',
    'In Review': 'sky',
    'Resolved': 'success',
    'Closed': 'default',
    'Escalated': 'danger',
  };
  return <Badge variant={map[status] || 'default'}>{status}</Badge>;
};

const LAB_ID = 'c1111111-1111-1111-1111-111111111111';

export const TicketsList: React.FC = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [promoteModal, setPromoteModal] = useState<{ open: boolean; ticketId: string; ticketNum: string }>({ open: false, ticketId: '', ticketNum: '' });

  const [addForm, setAddForm] = useState({
    reporter_name: '',
    reporter_phone: '',
    laboratory_id: LAB_ID,
    complaint_details: '',
    ticket_status: 'Open' as const,
  });

  const [promoteForm, setPromoteForm] = useState({
    incident_title: '',
    incident_description: '',
    severity: 'Medium' as const,
  });

  const filters: Record<string, any> = {};
  if (statusFilter) filters.ticket_status = statusFilter;

  const { data: ticketsData, isLoading } = useTickets(filters);
  const { mutate: createTicket } = useCreateTicket();
  const { mutate: promoteTicket } = usePromoteTicket();

  const tickets = Array.isArray(ticketsData) ? ticketsData : [];
  
  // Client-side search
  const filtered = search
    ? tickets.filter((t: any) =>
        t.ticket_number?.toLowerCase().includes(search.toLowerCase()) ||
        t.reporter_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.complaint_details?.toLowerCase().includes(search.toLowerCase())
      )
    : tickets;

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket(addForm, {
      onSuccess: () => {
        toast('success', 'Tiket pengaduan berhasil dibuat.');
        setAddModalOpen(false);
        setAddForm({ reporter_name: '', reporter_phone: '', laboratory_id: LAB_ID, complaint_details: '', ticket_status: 'Open' });
      },
      onError: (err: any) => toast('error', err.message || 'Gagal membuat tiket.'),
    });
  };

  const handlePromoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    promoteTicket({
      incidentData: { ...promoteForm, ticket_id: promoteModal.ticketId },
      newTicketStatus: 'Escalated',
    }, {
      onSuccess: () => {
        toast('success', `Tiket ${promoteModal.ticketNum} berhasil dipromosikan menjadi insiden.`);
        setPromoteModal({ open: false, ticketId: '', ticketNum: '' });
        setPromoteForm({ incident_title: '', incident_description: '', severity: 'Medium' });
      },
      onError: (err: any) => toast('error', err.message || 'Gagal mempromosikan tiket.'),
    });
  };

  // Stats
  const openCount = tickets.filter((t: any) => t.ticket_status === 'Open').length;
  const escalatedCount = tickets.filter((t: any) => t.ticket_status === 'Escalated').length;
  const resolvedCount = tickets.filter((t: any) => t.ticket_status === 'Resolved').length;

  const columns: Column<any>[] = [
    {
      header: 'No. Tiket',
      accessor: (row) => (
        <span className="font-mono text-xs font-bold text-sky-600 dark:text-sky-400">
          {row.ticket_number || `#${String(row.id).slice(0, 8).toUpperCase()}`}
        </span>
      ),
    },
    {
      header: 'Pelapor',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100">{row.reporter_name}</p>
          <p className="text-xs text-slate-400">{row.reporter_phone || '—'}</p>
        </div>
      ),
    },
    {
      header: 'Detail Keluhan',
      accessor: (row) => (
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xs truncate" title={row.complaint_details}>
          {row.complaint_details}
        </p>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => statusBadge(row.ticket_status),
    },
    {
      header: 'Tanggal Lapor',
      accessor: (row) => (
        <span className="text-sm text-slate-500">
          {row.created_at ? new Date(row.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
        </span>
      ),
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        <div className="flex gap-1.5">
          {(row.ticket_status === 'Open' || row.ticket_status === 'In Review') && (
            <Button
              variant="outline"
              size="sm"
              icon={<ArrowUpCircle className="w-3.5 h-3.5 text-rose-500" />}
              onClick={() => setPromoteModal({ open: true, ticketId: row.id, ticketNum: row.ticket_number || row.id })}
            >
              Eskalasi
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Tiket Pengaduan User
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Laporan keluhan kerusakan perangkat dari pengguna laboratorium.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setAddModalOpen(true)}
        >
          Buat Tiket
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <Ticket className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Open</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{openCount}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <AlertOctagon className="w-5 h-5 text-rose-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Eskalasi</p>
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">{escalatedCount}</p>
          </div>
        </Card>
        <Card className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
            <Ticket className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Resolved</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{resolvedCount}</p>
          </div>
        </Card>
      </div>

      {/* FILTER */}
      <Card className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 items-end">
        <Input
          label="Cari Tiket"
          placeholder="Cari no. tiket, nama pelapor, keluhan..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={<Search className="w-4 h-4" />}
        />
        <Select
          label="Filter Status"
          options={[
            { value: '', label: 'Semua Status' },
            { value: 'Open', label: 'Open' },
            { value: 'In Review', label: 'In Review' },
            { value: 'Resolved', label: 'Resolved' },
            { value: 'Closed', label: 'Closed' },
            { value: 'Escalated', label: 'Escalated' },
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
        emptyTitle="Tidak Ada Tiket"
        emptyDescription="Belum ada laporan keluhan dari pengguna laboratorium."
        page={page}
        pageSize={pageSize}
        totalCount={filtered.length}
        onPageChange={setPage}
      />

      {/* ADD MODAL */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Buat Tiket Pengaduan Baru">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nama Pelapor"
              value={addForm.reporter_name}
              onChange={(e) => setAddForm((prev) => ({ ...prev, reporter_name: e.target.value }))}
              placeholder="Nama lengkap pelapor"
              required
            />
            <Input
              label="No. HP (opsional)"
              value={addForm.reporter_phone}
              onChange={(e) => setAddForm((prev) => ({ ...prev, reporter_phone: e.target.value }))}
              placeholder="08xx-xxxx-xxxx"
            />
          </div>
          <Select
            label="Laboratorium"
            options={[
              { value: 'c1111111-1111-1111-1111-111111111111', label: 'Lab A (Pemrograman)' },
              { value: 'c2222222-2222-2222-2222-222222222222', label: 'Lab B (Jaringan)' },
            ]}
            value={addForm.laboratory_id}
            onChange={(e) => setAddForm((prev) => ({ ...prev, laboratory_id: e.target.value }))}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Detail Keluhan</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              rows={3}
              placeholder="Jelaskan keluhan secara detail..."
              value={addForm.complaint_details}
              onChange={(e) => setAddForm((prev) => ({ ...prev, complaint_details: e.target.value }))}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary">Kirim Tiket</Button>
          </div>
        </form>
      </Modal>

      {/* PROMOTE MODAL */}
      <Modal isOpen={promoteModal.open} onClose={() => setPromoteModal({ open: false, ticketId: '', ticketNum: '' })} title={`Eskalasi Tiket ${promoteModal.ticketNum} → Insiden`}>
        <form onSubmit={handlePromoteSubmit} className="space-y-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-sm text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 flex-shrink-0" />
            Tiket akan dipromosikan menjadi insiden teknis dan status berubah ke <strong>Escalated</strong>.
          </div>
          <Input
            label="Judul Insiden"
            value={promoteForm.incident_title}
            onChange={(e) => setPromoteForm((prev) => ({ ...prev, incident_title: e.target.value }))}
            placeholder="Judul singkat insiden..."
            required
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi Insiden</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
              rows={3}
              placeholder="Deskripsi teknis insiden..."
              value={promoteForm.incident_description}
              onChange={(e) => setPromoteForm((prev) => ({ ...prev, incident_description: e.target.value }))}
              required
            />
          </div>
          <Select
            label="Tingkat Keparahan"
            options={[
              { value: 'Low', label: '🟢 Low' },
              { value: 'Medium', label: '🟡 Medium' },
              { value: 'High', label: '🟠 High' },
              { value: 'Critical', label: '🔴 Critical' },
            ]}
            value={promoteForm.severity}
            onChange={(e) => setPromoteForm((prev) => ({ ...prev, severity: e.target.value as any }))}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setPromoteModal({ open: false, ticketId: '', ticketNum: '' })}>Batal</Button>
            <Button type="submit" variant="primary" icon={<ArrowUpCircle className="w-4 h-4" />}>Eskalasi ke Insiden</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TicketsList;
