import React, { useState } from 'react';
import { useDnsRecords, useCreateDnsRecord } from './queries';
import { DataTable, Column } from '../../shared/components/ui/DataTable';
import { Badge } from '../../shared/components/ui/Badge';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';
import { Select } from '../../shared/components/ui/Select';
import { useToast } from '../../shared/components/Toast';
import { Search, Plus, Globe } from 'lucide-react';

const recordTypeColors: Record<string, any> = {
  'A': 'sky',
  'AAAA': 'indigo',
  'CNAME': 'violet',
  'MX': 'warning',
  'TXT': 'default',
};

export const DnsRecordsList: React.FC = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    domain_name: '',
    record_type: 'A',
    record_value: '',
    ttl: 3600,
  });

  const filters: Record<string, any> = {};
  if (recordTypeFilter) filters.record_type = recordTypeFilter;

  const { data, isLoading } = useDnsRecords(filters);
  const { mutate: createDnsRecord } = useCreateDnsRecord();

  const records = data?.data || [];

  // Client-side search
  const filtered = search
    ? records.filter((r: any) =>
        r.domain_name?.toLowerCase().includes(search.toLowerCase()) ||
        r.record_value?.toLowerCase().includes(search.toLowerCase())
      )
    : records;

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createDnsRecord(addForm, {
      onSuccess: () => {
        toast('success', `DNS Record "${addForm.domain_name}" berhasil dibuat.`);
        setAddModalOpen(false);
        setAddForm({ domain_name: '', record_type: 'A', record_value: '', ttl: 3600 });
      },
      onError: (err: any) => toast('error', err.message || 'Gagal menambahkan DNS Record.'),
    });
  };

  const columns: Column<any>[] = [
    {
      header: 'Domain Name',
      accessor: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
          {row.domain_name}
        </span>
      ),
      sortable: true,
      sortKey: 'domain_name',
    },
    {
      header: 'Tipe Record',
      accessor: (row) => (
        <Badge variant={recordTypeColors[row.record_type] || 'default'}>
          {row.record_type}
        </Badge>
      ),
      sortable: true,
      sortKey: 'record_type',
    },
    {
      header: 'Record Value',
      accessor: (row) => (
        <span className="font-mono text-sm text-slate-600 dark:text-slate-300 break-all">
          {row.record_value}
        </span>
      ),
    },
    {
      header: 'TTL',
      accessor: (row) => (
        <span className="text-xs text-slate-500">
          {row.ttl} Detik
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
            DNS Records
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Daftar pemetaan DNS domain internal dan IP Address untuk jaringan lokal (`labnet.ac.id`).
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>
          Tambah DNS Record
        </Button>
      </div>

      {/* FILTER */}
      <Card className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 items-end">
        <Input
          label="Cari DNS Record"
          placeholder="Cari domain atau value..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={<Search className="w-4 h-4" />}
        />
        <Select
          label="Filter Tipe Record"
          options={[
            { value: '', label: 'Semua Tipe' },
            { value: 'A', label: 'A' },
            { value: 'AAAA', label: 'AAAA' },
            { value: 'CNAME', label: 'CNAME' },
            { value: 'MX', label: 'MX' },
            { value: 'TXT', label: 'TXT' },
          ]}
          value={recordTypeFilter}
          onChange={(e) => { setRecordTypeFilter(e.target.value); setPage(1); }}
        />
      </Card>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={paged}
        loading={isLoading}
        emptyTitle="Tidak Ada DNS Record"
        emptyDescription="Belum ada record DNS terdaftar dalam database."
        page={page}
        pageSize={pageSize}
        totalCount={filtered.length}
        onPageChange={setPage}
      />

      {/* ADD MODAL */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Tambah DNS Record Baru">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Domain Name"
              value={addForm.domain_name}
              onChange={(e) => setAddForm((p) => ({ ...p, domain_name: e.target.value }))}
              placeholder="e.g. gateway.labnet.ac.id"
              required
            />
            <Select
              label="Tipe Record"
              options={[
                { value: 'A', label: 'A' },
                { value: 'AAAA', label: 'AAAA' },
                { value: 'CNAME', label: 'CNAME' },
                { value: 'MX', label: 'MX' },
                { value: 'TXT', label: 'TXT' },
              ]}
              value={addForm.record_type}
              onChange={(e) => setAddForm((p) => ({ ...p, record_type: e.target.value }))}
            />
          </div>
          <Input
            label="Record Value"
            value={addForm.record_value}
            onChange={(e) => setAddForm((p) => ({ ...p, record_value: e.target.value }))}
            placeholder="e.g. 192.168.10.1"
            required
          />
          <Input
            label="TTL (detik)"
            type="number"
            value={addForm.ttl.toString()}
            onChange={(e) => setAddForm((p) => ({ ...p, ttl: Number(e.target.value) }))}
            placeholder="3600"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" icon={<Globe className="w-4 h-4" />}>Simpan Record</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DnsRecordsList;
