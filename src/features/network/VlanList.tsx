import React, { useState, useEffect } from 'react';
import { useVlans, useCreateVlan } from './queries';
import { DataTable, Column } from '../../shared/components/ui/DataTable';
import { Badge } from '../../shared/components/ui/Badge';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';
import { Select } from '../../shared/components/ui/Select';
import { useToast } from '../../shared/components/Toast';
import { Search, Plus, Network, Layers } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export const VlanList: React.FC = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [labs, setLabs] = useState<Array<{ id: string; lab_name: string }>>([]);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    vlan_number: 10,
    vlan_name: '',
    laboratory_id: 'c1111111-1111-1111-1111-111111111111',
  });

  // Load labs dynamically
  useEffect(() => {
    async function loadLabs() {
      const { data } = await supabase
        .from('laboratories')
        .select('id, lab_name')
        .is('deleted_at', null)
        .order('lab_name');
      if (data) {
        setLabs(data);
        if (data.length > 0) {
          setAddForm(p => ({ ...p, laboratory_id: data[0].id }));
        }
      }
    }
    loadLabs();
  }, []);

  const { data, isLoading } = useVlans();
  const { mutate: createVlan } = useCreateVlan();

  const vlans = data?.data || [];

  // Client-side search
  const filtered = search
    ? vlans.filter((v: any) =>
        v.vlan_name?.toLowerCase().includes(search.toLowerCase()) ||
        String(v.vlan_number).includes(search)
      )
    : vlans;

  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVlan(addForm, {
      onSuccess: () => {
        toast('success', `VLAN ${addForm.vlan_number} (${addForm.vlan_name}) berhasil dibuat.`);
        setAddModalOpen(false);
        setAddForm({ vlan_number: addForm.vlan_number + 10, vlan_name: '', laboratory_id: 'c1111111-1111-1111-1111-111111111111' });
      },
      onError: (err: any) => toast('error', err.message || 'Gagal menambahkan VLAN.'),
    });
  };

  const columns: Column<any>[] = [
    {
      header: 'VLAN ID',
      accessor: (row) => (
        <span className="font-mono text-sm font-bold text-sky-600 dark:text-sky-400">
          VLAN {row.vlan_number}
        </span>
      ),
      sortable: true,
      sortKey: 'vlan_number',
    },
    {
      header: 'Nama VLAN',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            {row.vlan_name}
          </span>
        </div>
      ),
      sortable: true,
      sortKey: 'vlan_name',
    },
    {
      header: 'Laboratorium',
      accessor: (row) => {
        const lab = labs.find(l => l.id === row.laboratory_id);
        return (
          <Badge variant="indigo">
            {lab ? lab.lab_name : '—'}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Segmentasi VLAN
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Daftar segmentasi Virtual Local Area Network (VLAN) untuk memisahkan traffic jaringan lab.
          </p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setAddModalOpen(true)}>
          Tambah VLAN
        </Button>
      </div>

      {/* FILTER */}
      <Card className="p-4">
        <Input
          label="Cari VLAN"
          placeholder="Cari nomor VLAN atau nama..."
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
        emptyTitle="Tidak Ada VLAN"
        emptyDescription="Belum ada VLAN terdaftar atau tidak cocok dengan pencarian."
        page={page}
        pageSize={pageSize}
        totalCount={filtered.length}
        onPageChange={setPage}
      />

      {/* ADD MODAL */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Tambah VLAN Baru">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nomor VLAN"
              type="number"
              value={addForm.vlan_number.toString()}
              onChange={(e) => setAddForm((p) => ({ ...p, vlan_number: Number(e.target.value) }))}
              placeholder="e.g. 10"
              required
            />
            <Input
              label="Nama VLAN"
              value={addForm.vlan_name}
              onChange={(e) => setAddForm((p) => ({ ...p, vlan_name: e.target.value }))}
              placeholder="e.g. VLAN_LAB_PEMROGRAMAN"
              required
            />
          </div>
          <Select
            label="Laboratorium Penempatan"
            options={labs.map(l => ({ value: l.id, label: l.lab_name }))}
            value={addForm.laboratory_id}
            onChange={(e) => setAddForm((p) => ({ ...p, laboratory_id: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setAddModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary" icon={<Network className="w-4 h-4" />}>Simpan VLAN</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VlanList;
