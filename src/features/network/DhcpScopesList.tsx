import React, { useState, useEffect } from 'react';
import { useDhcpScopes, useCreateDhcpScope } from './queries';
import { DataTable, Column } from '../../shared/components/ui/DataTable';
import { Badge } from '../../shared/components/ui/Badge';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';
import { Select } from '../../shared/components/ui/Select';
import { useToast } from '../../shared/components/Toast';
import { supabase } from '../../lib/supabase';
import { Search, Plus, Cpu } from 'lucide-react';

export const DhcpScopesList: React.FC = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [subnets, setSubnets] = useState<Array<{ id: string; subnet_cidr: string }>>([]);
  const [addForm, setAddForm] = useState({
    subnet_id: '',
    scope_name: '',
    ip_start: '',
    ip_end: '',
    lease_time_seconds: 86400,
  });

  const { data, isLoading } = useDhcpScopes();
  const { mutate: createDhcpScope } = useCreateDhcpScope();

  useEffect(() => {
    // Load subnets for selection in create scope form
    async function loadSubnets() {
      const { data: subnetsData } = await supabase
        .from('subnets')
        .select('id, subnet_cidr');
      if (subnetsData) {
        setSubnets(subnetsData);
        if (subnetsData.length > 0) {
          setAddForm((p) => ({ ...p, subnet_id: subnetsData[0].id }));
        }
      }
    }
    loadSubnets();
  }, []);

  const scopes = data?.data || [];

  // Client-side search
  const filtered = search
    ? scopes.filter((s: any) =>
        s.scope_name?.toLowerCase().includes(search.toLowerCase()) ||
        s.ip_start?.includes(search) ||
        s.ip_end?.includes(search)
      )
    : scopes;

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.subnet_id) {
      toast('error', 'Pilih subnet terlebih dahulu.');
      return;
    }
    createDhcpScope(addForm, {
      onSuccess: () => {
        toast('success', `DHCP Scope "${addForm.scope_name}" berhasil dibuat.`);
        setAddModalOpen(false);
        setAddForm((p) => ({ ...p, scope_name: '', ip_start: '', ip_end: '' }));
      },
      onError: (err: any) => toast('error', err.message || 'Gagal menambahkan DHCP Scope.'),
    });
  };

  const columns: Column<any>[] = [
    {
      header: 'Scope Name',
      accessor: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
          {row.scope_name}
        </span>
      ),
      sortable: true,
      sortKey: 'scope_name',
    },
    {
      header: 'Subnet CIDR',
      accessor: (row) => (
        <Badge variant="indigo">
          {row.subnet?.subnet_cidr || '—'}
        </Badge>
      ),
    },
    {
      header: 'IP Start Range',
      accessor: (row) => (
        <span className="font-mono text-sm text-slate-600 dark:text-slate-300">
          {row.ip_start}
        </span>
      ),
    },
    {
      header: 'IP End Range',
      accessor: (row) => (
        <span className="font-mono text-sm text-slate-600 dark:text-slate-300">
          {row.ip_end}
        </span>
      ),
    },
    {
      header: 'Lease Time',
      accessor: (row) => (
        <span className="text-xs text-slate-500">
          {row.lease_time_seconds ? `${row.lease_time_seconds / 3600} Jam` : '—'}
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
            DHCP Scopes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Daftar rentang alamat IP untuk alokasi dynamic IP address (DHCP) per subnet.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>
          Tambah DHCP Scope
        </Button>
      </div>

      {/* FILTER */}
      <Card className="p-4">
        <Input
          label="Cari DHCP Scope"
          placeholder="Cari nama scope atau range IP..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          icon={<Search className="w-4 h-4" />}
        />
      </Card>

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={paged}
        loading={isLoading}
        emptyTitle="Tidak Ada DHCP Scope"
        emptyDescription="Belum ada DHCP scope yang dikonfigurasi dalam database."
        page={page}
        pageSize={pageSize}
        totalCount={filtered.length}
        onPageChange={setPage}
      />

      {/* ADD MODAL */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Tambah DHCP Scope Baru">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nama Scope"
              value={addForm.scope_name}
              onChange={(e) => setAddForm((p) => ({ ...p, scope_name: e.target.value }))}
              placeholder="e.g. DHCP_LAB_A"
              required
            />
            <Select
              label="Pilih Subnet"
              options={subnets.map((sub) => ({ value: sub.id, label: sub.subnet_cidr }))}
              value={addForm.subnet_id}
              onChange={(e) => setAddForm((p) => ({ ...p, subnet_id: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="IP Start"
              value={addForm.ip_start}
              onChange={(e) => setAddForm((p) => ({ ...p, ip_start: e.target.value }))}
              placeholder="e.g. 192.168.10.10"
              required
            />
            <Input
              label="IP End"
              value={addForm.ip_end}
              onChange={(e) => setAddForm((p) => ({ ...p, ip_end: e.target.value }))}
              placeholder="e.g. 192.168.10.100"
              required
            />
          </div>
          <Input
            label="Lease Time (detik)"
            type="number"
            value={addForm.lease_time_seconds.toString()}
            onChange={(e) => setAddForm((p) => ({ ...p, lease_time_seconds: Number(e.target.value) }))}
            placeholder="86400"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" icon={<Cpu className="w-4 h-4" />}>Simpan DHCP Scope</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default DhcpScopesList;
