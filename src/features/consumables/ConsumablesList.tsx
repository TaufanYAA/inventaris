import React, { useState, useEffect } from 'react';
import {
  useConsumableItems,
  useCreateConsumableItem,
  useConsumableTransactions,
  useRecordTransaction,
  useLoans,
  useRequestLoan,
  useReturnLoan
} from './queries';
import { DataTable, Column } from '../../shared/components/ui/DataTable';
import { Badge } from '../../shared/components/ui/Badge';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';
import { Select } from '../../shared/components/ui/Select';
import { useToast } from '../../shared/components/Toast';
import { supabase } from '../../lib/supabase';
import { Search, Plus, Archive, History, BookOpen, AlertTriangle, ArrowDownRight, ArrowUpRight } from 'lucide-react';

const ADMIN_USER_ID = 'u0000001-0000-0000-0000-000000000001';

export const ConsumablesList: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'inventory' | 'transactions' | 'loans'>('inventory');
  const [search, setSearch] = useState('');

  // Modals state
  const [addCatalogModal, setAddCatalogModal] = useState(false);
  const [mutationModal, setMutationModal] = useState<{ open: boolean; item: any }>({ open: false, item: null });
  const [loanModal, setLoanModal] = useState(false);

  // Lists for dropdown selections
  const [users, setUsers] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);

  // Forms state
  const [catalogForm, setCatalogForm] = useState({
    item_name: '',
    item_brand: '',
    min_stock_alert: 5,
    unit_type: 'pcs',
    item_description: '',
  });

  const [mutationForm, setMutationForm] = useState({
    transaction_type: 'Stock In' as 'Stock In' | 'Stock Out',
    quantity: 1,
    transaction_notes: '',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const [loanForm, setLoanForm] = useState({
    borrower_id: '',
    borrow_date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    purpose_description: '',
    inventory_item_id: '',
    quantity: 1,
  });

  // Queries
  const { data: itemsData, isLoading: loadingItems } = useConsumableItems();
  const { data: txData, isLoading: loadingTx } = useConsumableTransactions();
  const { data: loansData, isLoading: loadingLoans } = useLoans();

  const { mutate: createCatalog } = useCreateConsumableItem();
  const { mutate: recordTx } = useRecordTransaction();
  const { mutate: requestLoan } = useRequestLoan();
  const { mutate: returnLoan } = useReturnLoan();

  const itemsList = itemsData?.data || [];
  const transactions = txData || [];
  const loans = loansData || [];

  // Load lists
  useEffect(() => {
    async function loadSelectOptions() {
      const { data: userData } = await supabase.from('users').select('id, full_name').order('full_name');
      const { data: invData } = await supabase.from('inventory_items').select('id, item_name, brand, available_quantity').eq('deleted_at', null).order('item_name');
      if (userData) {
        setUsers(userData);
        if (userData.length > 0) setLoanForm((p) => ({ ...p, borrower_id: userData[0].id }));
      }
      if (invData) {
        setInventoryItems(invData);
        if (invData.length > 0) setLoanForm((p) => ({ ...p, inventory_item_id: invData[0].id }));
      }
    }
    loadSelectOptions();
  }, []);

  const handleCreateCatalog = (e: React.FormEvent) => {
    e.preventDefault();
    createCatalog(catalogForm, {
      onSuccess: () => {
        toast('success', `Katalog barang "${catalogForm.item_name}" berhasil dibuat.`);
        setAddCatalogModal(false);
        setCatalogForm({ item_name: '', item_brand: '', min_stock_alert: 5, unit_type: 'pcs', item_description: '' });
      },
      onError: (err: any) => toast('error', err.message || 'Gagal menambahkan barang.'),
    });
  };

  const handleRecordMutation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutationModal.item) return;

    const payload = {
      ...mutationForm,
      consumable_item_id: mutationModal.item.id,
      created_by: ADMIN_USER_ID,
    };

    recordTx(payload, {
      onSuccess: () => {
        toast('success', 'Transaksi sirkulasi stok berhasil dicatat.');
        setMutationModal({ open: false, item: null });
        setMutationForm({ transaction_type: 'Stock In', quantity: 1, transaction_notes: '', transaction_date: new Date().toISOString().split('T')[0] });
      },
      onError: (err: any) => toast('error', err.message || 'Gagal mencatat mutasi stok.'),
    });
  };

  const handleRequestLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loanForm.borrower_id || !loanForm.inventory_item_id) {
      toast('error', 'Lengkapi form peminjaman.');
      return;
    }

    const borrowingData = {
      borrower_id: loanForm.borrower_id,
      borrow_date: loanForm.borrow_date,
      due_date: loanForm.due_date,
      purpose_description: loanForm.purpose_description,
      created_by: ADMIN_USER_ID,
    };

    const items = [{
      inventory_item_id: loanForm.inventory_item_id,
      quantity: loanForm.quantity,
      item_condition_out: 'Baik',
    }];

    requestLoan({ borrowingData, items }, {
      onSuccess: () => {
        toast('success', 'Peminjaman aset berhasil dicatat.');
        setLoanModal(false);
        setLoanForm((prev) => ({ ...prev, purpose_description: '', quantity: 1 }));
      },
      onError: (err: any) => toast('error', err.message || 'Gagal membuat peminjaman.'),
    });
  };

  const handleReturnLoanAction = (loan: any) => {
    const detail = loan.borrowing_details?.[0];
    if (!detail) {
      toast('error', 'Detail barang pinjaman tidak ditemukan.');
      return;
    }

    const itemsReturn = [{
      detail_id: detail.id,
      inventory_item_id: detail.inventory_item_id,
      quantity: detail.quantity,
      condition_in: 'Baik',
    }];

    returnLoan({ borrowingId: loan.id, itemsReturn }, {
      onSuccess: () => {
        toast('success', 'Barang pinjaman berhasil dikembalikan.');
      },
      onError: (err: any) => toast('error', err.message || 'Gagal mengembalikan barang.'),
    });
  };

  // Client-side search filters
  const filteredItems = itemsList.filter((item: any) =>
    item.item_name?.toLowerCase().includes(search.toLowerCase()) ||
    item.item_brand?.toLowerCase().includes(search.toLowerCase())
  );

  const columnsItems: Column<any>[] = [
    {
      header: 'Nama Barang',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{row.item_name}</p>
          <p className="text-xs text-slate-400">{row.item_brand || 'No Brand'}</p>
        </div>
      ),
    },
    {
      header: 'Stok Tersedia',
      accessor: (row) => {
        const isLow = (row.available_quantity || 0) <= (row.min_stock_alert || 0);
        return (
          <div className="flex items-center gap-2">
            <span className={`font-mono text-sm font-bold ${isLow ? 'text-rose-500' : 'text-slate-800 dark:text-slate-200'}`}>
              {row.available_quantity || 0} {row.unit_type}
            </span>
            {isLow && (
              <Badge variant="danger" className="flex items-center gap-0.5 py-0.5 px-1.5 text-[10px]">
                <AlertTriangle className="w-3 h-3" /> Low Stock
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          icon={<History className="w-3.5 h-3.5" />}
          onClick={() => setMutationModal({ open: true, item: row })}
        >
          Mutasi Stok
        </Button>
      ),
    },
  ];

  const columnsTx: Column<any>[] = [
    {
      header: 'Tanggal',
      accessor: (row) => (
        <span className="text-sm font-medium">
          {new Date(row.transaction_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: 'Tipe',
      accessor: (row) => (
        row.transaction_type === 'Stock In' ? (
          <Badge variant="success" className="flex items-center gap-0.5"><ArrowUpRight className="w-3.5 h-3.5" /> Masuk</Badge>
        ) : (
          <Badge variant="danger" className="flex items-center gap-0.5"><ArrowDownRight className="w-3.5 h-3.5" /> Keluar</Badge>
        )
      ),
    },
    {
      header: 'Barang',
      accessor: (row) => (
        <span className="text-sm font-semibold">{row.consumable_item?.item_name || '—'}</span>
      ),
    },
    {
      header: 'Jumlah',
      accessor: (row) => (
        <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
          {row.quantity} unit
        </span>
      ),
    },
    {
      header: 'Catatan',
      accessor: (row) => (
        <span className="text-xs text-slate-500 truncate max-w-xs">{row.transaction_notes || '—'}</span>
      ),
    },
  ];

  const columnsLoans: Column<any>[] = [
    {
      header: 'Peminjam',
      accessor: (row) => (
        <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
          {row.borrower?.full_name || 'Unknown'}
        </span>
      ),
    },
    {
      header: 'Aset Dipinjam',
      accessor: (row) => {
        const detail = row.borrowing_details?.[0];
        return (
          <span className="text-sm">
            {detail?.inventory_item?.item_name || 'Item'} ({detail?.quantity || 1} pcs)
          </span>
        );
      },
    },
    {
      header: 'Tgl Pinjam / Kembali',
      accessor: (row) => (
        <div className="text-xs text-slate-500">
          <p>Pinjam: {new Date(row.borrow_date).toLocaleDateString('id-ID')}</p>
          <p className="text-rose-500 font-medium">Batas: {new Date(row.due_date).toLocaleDateString('id-ID')}</p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge variant={row.borrowing_status === 'Kembali' ? 'success' : 'warning'}>
          {row.borrowing_status}
        </Badge>
      ),
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        row.borrowing_status !== 'Kembali' ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleReturnLoanAction(row)}
          >
            Kembalikan
          </Button>
        ) : (
          <span className="text-xs text-slate-400 italic">Returned</span>
        )
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Barang Habis Pakai (Consumables)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            RJ45, kabel LAN, thermal paste, dan log sirkulasi peminjaman aset laboratorium.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {activeTab === 'inventory' ? (
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setAddCatalogModal(true)}>
              Tambah Item
            </Button>
          ) : activeTab === 'loans' ? (
            <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setLoanModal(true)}>
              Pinjam Aset
            </Button>
          ) : null}
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'inventory'
              ? 'border-sky-500 text-sky-500'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Archive className="w-4 h-4" /> Daftar Stok
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'transactions'
              ? 'border-sky-500 text-sky-500'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <History className="w-4 h-4" /> Log Sirkulasi
        </button>
        <button
          onClick={() => setActiveTab('loans')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'loans'
              ? 'border-sky-500 text-sky-500'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Peminjaman Aset
        </button>
      </div>

      {/* SEARCH AND FILTER */}
      {activeTab === 'inventory' && (
        <Card className="p-4">
          <Input
            label="Cari Barang"
            placeholder="Cari RJ45, kabel LAN, crimping tool..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </Card>
      )}

      {/* DATATABLES */}
      {activeTab === 'inventory' && (
        <DataTable
          columns={columnsItems}
          data={filteredItems}
          loading={loadingItems}
          emptyTitle="Tidak Ada Consumables"
          emptyDescription="Belum ada item barang habis pakai terdaftar."
          page={1}
          pageSize={100}
          totalCount={filteredItems.length}
          onPageChange={() => {}}
        />
      )}

      {activeTab === 'transactions' && (
        <DataTable
          columns={columnsTx}
          data={transactions}
          loading={loadingTx}
          emptyTitle="Tidak Ada Transaksi"
          emptyDescription="Belum ada pencatatan mutasi stok barang masuk atau keluar."
          page={1}
          pageSize={100}
          totalCount={transactions.length}
          onPageChange={() => {}}
        />
      )}

      {activeTab === 'loans' && (
        <DataTable
          columns={columnsLoans}
          data={loans}
          loading={loadingLoans}
          emptyTitle="Tidak Ada Peminjaman"
          emptyDescription="Belum ada riwayat peminjaman aset laboratorium."
          page={1}
          pageSize={100}
          totalCount={loans.length}
          onPageChange={() => {}}
        />
      )}

      {/* ADD CATALOG MODAL */}
      <Modal isOpen={addCatalogModal} onClose={() => setAddCatalogModal(false)} title="Tambah Katalog Barang Baru">
        <form onSubmit={handleCreateCatalog} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nama Barang"
              value={catalogForm.item_name}
              onChange={(e) => setCatalogForm((p) => ({ ...p, item_name: e.target.value }))}
              placeholder="e.g. Connector RJ45 Cat6"
              required
            />
            <Input
              label="Brand / Merek"
              value={catalogForm.item_brand}
              onChange={(e) => setCatalogForm((p) => ({ ...p, item_brand: e.target.value }))}
              placeholder="e.g. Belden, Amp"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Alert Stock"
              type="number"
              value={catalogForm.min_stock_alert.toString()}
              onChange={(e) => setCatalogForm((p) => ({ ...p, min_stock_alert: Number(e.target.value) }))}
              placeholder="5"
            />
            <Input
              label="Satuan Unit"
              value={catalogForm.unit_type}
              onChange={(e) => setCatalogForm((p) => ({ ...p, unit_type: e.target.value }))}
              placeholder="pcs, box, roll"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Deskripsi</label>
            <textarea
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-sky-500 resize-none text-slate-800 dark:text-slate-100"
              rows={3}
              value={catalogForm.item_description}
              onChange={(e) => setCatalogForm((p) => ({ ...p, item_description: e.target.value }))}
              placeholder="Spesifikasi atau deskripsi barang..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setAddCatalogModal(false)}>Batal</Button>
            <Button type="submit" variant="primary">Simpan Barang</Button>
          </div>
        </form>
      </Modal>

      {/* MUTATION MODAL */}
      <Modal isOpen={mutationModal.open} onClose={() => setMutationModal({ open: false, item: null })} title={mutationModal.item ? `Mutasi Stok: ${mutationModal.item.item_name}` : ''}>
        <form onSubmit={handleRecordMutation} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipe Transaksi"
              options={[
                { value: 'Stock In', label: 'Stock In (Barang Masuk)' },
                { value: 'Stock Out', label: 'Stock Out (Barang Keluar)' },
              ]}
              value={mutationForm.transaction_type}
              onChange={(e) => setMutationForm((p) => ({ ...p, transaction_type: e.target.value as any }))}
            />
            <Input
              label="Jumlah"
              type="number"
              value={mutationForm.quantity.toString()}
              onChange={(e) => setMutationForm((p) => ({ ...p, quantity: Number(e.target.value) }))}
              min="1"
              required
            />
          </div>
          <Input
            label="Catatan Mutasi"
            value={mutationForm.transaction_notes}
            onChange={(e) => setMutationForm((p) => ({ ...p, transaction_notes: e.target.value }))}
            placeholder="e.g. Pembelian APBN 2026 atau Dipakai pasang kabel Lab A"
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setMutationModal({ open: false, item: null })}>Batal</Button>
            <Button type="submit" variant="primary">Catat Mutasi</Button>
          </div>
        </form>
      </Modal>

      {/* LOAN REQUEST MODAL */}
      <Modal isOpen={loanModal} onClose={() => setLoanModal(false)} title="Buat Peminjaman Aset Baru">
        <form onSubmit={handleRequestLoanSubmit} className="space-y-4">
          <Select
            label="Pilih Anggota Peminjam"
            options={users.map((u) => ({ value: u.id, label: u.full_name }))}
            value={loanForm.borrower_id}
            onChange={(e) => setLoanForm((p) => ({ ...p, borrower_id: e.target.value }))}
          />
          <Select
            label="Pilih Barang / Aset Fisik"
            options={inventoryItems.map((inv) => ({ value: inv.id, label: `${inv.item_name} (Sisa: ${inv.available_quantity || 0})` }))}
            value={loanForm.inventory_item_id}
            onChange={(e) => setLoanForm((p) => ({ ...p, inventory_item_id: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Jumlah Pinjam"
              type="number"
              value={loanForm.quantity.toString()}
              onChange={(e) => setLoanForm((p) => ({ ...p, quantity: Number(e.target.value) }))}
              min="1"
              required
            />
            <Input
              label="Batas Pengembalian"
              type="date"
              value={loanForm.due_date}
              onChange={(e) => setLoanForm((p) => ({ ...p, due_date: e.target.value }))}
              required
            />
          </div>
          <Input
            label="Tujuan Peminjaman"
            value={loanForm.purpose_description}
            onChange={(e) => setLoanForm((p) => ({ ...p, purpose_description: e.target.value }))}
            placeholder="e.g. Kebutuhan praktikum Jaringan Kelas C"
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setLoanModal(false)}>Batal</Button>
            <Button type="submit" variant="primary">Kirim Peminjaman</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ConsumablesList;
