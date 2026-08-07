import React, { useState, useEffect } from 'react';
import {
  useSoftwareCatalog,
  useCreateSoftware,
  useSoftwareInstallations,
  useInstallSoftware
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
import { Search, Plus, Award, Laptop, Calendar, ShieldCheck, Download } from 'lucide-react';

const licenseColors: Record<string, any> = {
  'KMS': 'indigo',
  'OEM': 'violet',
  'Retail': 'success',
  'Subscription': 'warning',
  'Open Source': 'sky',
};

export const SoftwareList: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<'catalog' | 'installations'>('catalog');
  const [search, setSearch] = useState('');

  // Modals state
  const [addCatalogModal, setAddCatalogModal] = useState(false);
  const [installModal, setInstallModal] = useState(false);

  // Selection list
  const [computers, setComputers] = useState<any[]>([]);

  // Forms state
  const [catalogForm, setCatalogForm] = useState({
    software_name: '',
    version: '',
    license_key: '',
    license_type: 'Subscription',
    max_install_limit: 10,
    expiry_date: '',
  });

  const [installForm, setInstallForm] = useState({
    computer_id: '',
    software_id: '',
    installed_date: new Date().toISOString().split('T')[0],
  });

  // Queries
  const { data: catalogData, isLoading: loadingCatalog } = useSoftwareCatalog();
  const { data: installData, isLoading: loadingInstall } = useSoftwareInstallations();

  const { mutate: createSoftware } = useCreateSoftware();
  const { mutate: installSoftware } = useInstallSoftware();

  const catalog = catalogData?.data || [];
  const installations = installData || [];

  // Load computers and default selection
  useEffect(() => {
    async function loadComputers() {
      const { data } = await supabase
        .from('computers')
        .select('id, computer_name')
        .is('deleted_at', null)
        .order('computer_name');
      if (data) {
        setComputers(data);
        if (data.length > 0) setInstallForm((p) => ({ ...p, computer_id: data[0].id }));
      }
    }
    loadComputers();
  }, []);

  // Set default software in install form when catalog updates
  useEffect(() => {
    if (catalog.length > 0) {
      setInstallForm((p) => ({ ...p, software_id: catalog[0].id }));
    }
  }, [catalog]);

  const handleCreateSoftwareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSoftware({
      ...catalogForm,
      max_install_limit: catalogForm.max_install_limit ? Number(catalogForm.max_install_limit) : null,
      expiry_date: catalogForm.expiry_date || null,
      license_key: catalogForm.license_key || null,
    }, {
      onSuccess: () => {
        toast('success', `Software "${catalogForm.software_name}" berhasil didaftarkan ke katalog.`);
        setAddCatalogModal(false);
        setCatalogForm({ software_name: '', version: '', license_key: '', license_type: 'Subscription', max_install_limit: 10, expiry_date: '' });
      },
      onError: (err: any) => toast('error', err.message || 'Gagal mendaftarkan software.'),
    });
  };

  const handleInstallSoftwareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!installForm.computer_id || !installForm.software_id) {
      toast('error', 'Lengkapi form instalasi software.');
      return;
    }
    installSoftware(installForm, {
      onSuccess: () => {
        toast('success', 'Software berhasil diinstal ke workstation.');
        setInstallModal(false);
      },
      onError: (err: any) => toast('error', err.message || 'Gagal mencatat instalasi software.'),
    });
  };

  // Client-side search filters
  const filteredCatalog = catalog.filter((sw: any) =>
    sw.software_name?.toLowerCase().includes(search.toLowerCase()) ||
    sw.license_type?.toLowerCase().includes(search.toLowerCase())
  );

  const columnsCatalog: Column<any>[] = [
    {
      header: 'Nama Software',
      accessor: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950 flex items-center justify-center">
            <Award className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm">{row.software_name}</p>
            <p className="text-xs text-slate-400">Versi: {row.version}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Tipe Lisensi',
      accessor: (row) => (
        <Badge variant={licenseColors[row.license_type] || 'default'}>
          {row.license_type}
        </Badge>
      ),
    },
    {
      header: 'Lisensi Key',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-500 max-w-[120px] truncate block" title={row.license_key}>
          {row.license_key || <span className="italic text-slate-300">No Key / Free</span>}
        </span>
      ),
    },
    {
      header: 'Batas Install',
      accessor: (row) => (
        <span className="text-sm font-semibold">
          {row.max_install_limit ? `${row.max_install_limit} Workstation` : 'Unlimited'}
        </span>
      ),
    },
    {
      header: 'Masa Berlaku',
      accessor: (row) => (
        <span className="text-xs text-slate-500">
          {row.expiry_date ? (
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(row.expiry_date).toLocaleDateString('id-ID')}</span>
          ) : (
            <span className="italic text-slate-300">Lifetime</span>
          )}
        </span>
      ),
    },
  ];

  const columnsInstall: Column<any>[] = [
    {
      header: 'Workstation Komputer',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <Laptop className="w-4 h-4 text-slate-400" />
          <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
            {row.computer?.computer_name || 'PC'}
          </span>
        </div>
      ),
    },
    {
      header: 'Software',
      accessor: (row) => (
        <div>
          <p className="font-semibold text-sm text-slate-700 dark:text-slate-300">{row.software?.software_name}</p>
          <p className="text-xs text-slate-400">Ver: {row.software?.version}</p>
        </div>
      ),
    },
    {
      header: 'Lisensi',
      accessor: (row) => (
        <Badge variant={licenseColors[row.software?.license_type] || 'default'}>
          {row.software?.license_type || '—'}
        </Badge>
      ),
    },
    {
      header: 'Tanggal Install',
      accessor: (row) => (
        <span className="text-xs text-slate-500 font-semibold">
          {row.installed_date ? new Date(row.installed_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
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
            Katalog Lisensi Software
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Daftar software berlisensi, sistem operasi workstation, dan pemetaan instalasi di laboratorium.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={() => setInstallModal(true)}>
            Install Software
          </Button>
          <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setAddCatalogModal(true)}>
            Daftarkan Software
          </Button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'catalog'
              ? 'border-sky-500 text-sky-500'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Award className="w-4 h-4" /> Katalog Software
        </button>
        <button
          onClick={() => setActiveTab('installations')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            activeTab === 'installations'
              ? 'border-sky-500 text-sky-500'
              : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
          }`}
        >
          <Laptop className="w-4 h-4" /> Pemetaan Workstation
        </button>
      </div>

      {/* FILTER */}
      {activeTab === 'catalog' && (
        <Card className="p-4">
          <Input
            label="Cari Software"
            placeholder="Cari nama software, tipe lisensi..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </Card>
      )}

      {/* TABLE */}
      {activeTab === 'catalog' && (
        <DataTable
          columns={columnsCatalog}
          data={filteredCatalog}
          loading={loadingCatalog}
          emptyTitle="Tidak Ada Software"
          emptyDescription="Belum ada software yang didaftarkan dalam katalog lisensi."
          page={1}
          pageSize={100}
          totalCount={filteredCatalog.length}
          onPageChange={() => {}}
        />
      )}

      {activeTab === 'installations' && (
        <DataTable
          columns={columnsInstall}
          data={installations}
          loading={loadingInstall}
          emptyTitle="Tidak Ada Instalasi"
          emptyDescription="Belum ada pencatatan instalasi software di komputer workstation."
          page={1}
          pageSize={100}
          totalCount={installations.length}
          onPageChange={() => {}}
        />
      )}

      {/* ADD CATALOG MODAL */}
      <Modal isOpen={addCatalogModal} onClose={() => setAddCatalogModal(false)} title="Daftarkan Software Baru">
        <form onSubmit={handleCreateSoftwareSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Nama Software"
              value={catalogForm.software_name}
              onChange={(e) => setCatalogForm((p) => ({ ...p, software_name: e.target.value }))}
              placeholder="e.g. Adobe Photoshop CC 2026"
              required
            />
            <Input
              label="Versi"
              value={catalogForm.version}
              onChange={(e) => setCatalogForm((p) => ({ ...p, version: e.target.value }))}
              placeholder="e.g. 25.0"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Tipe Lisensi"
              options={[
                { value: 'Subscription', label: 'Subscription' },
                { value: 'KMS', label: 'KMS (Volume License)' },
                { value: 'OEM', label: 'OEM' },
                { value: 'Retail', label: 'Retail' },
                { value: 'Open Source', label: 'Open Source' },
              ]}
              value={catalogForm.license_type}
              onChange={(e) => setCatalogForm((p) => ({ ...p, license_type: e.target.value }))}
            />
            <Input
              label="Batas Maksimal Instalasi"
              type="number"
              value={catalogForm.max_install_limit.toString()}
              onChange={(e) => setCatalogForm((p) => ({ ...p, max_install_limit: Number(e.target.value) }))}
              placeholder="10"
            />
          </div>
          <Input
            label="License Key (opsional)"
            value={catalogForm.license_key}
            onChange={(e) => setCatalogForm((p) => ({ ...p, license_key: e.target.value }))}
            placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
          />
          <Input
            label="Tanggal Kadaluarsa Lisensi (opsional)"
            type="date"
            value={catalogForm.expiry_date}
            onChange={(e) => setCatalogForm((p) => ({ ...p, expiry_date: e.target.value }))}
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setAddCatalogModal(false)}>Batal</Button>
            <Button type="submit" variant="primary" icon={<ShieldCheck className="w-4 h-4" />}>Daftarkan Software</Button>
          </div>
        </form>
      </Modal>

      {/* INSTALL SOFTWARE MODAL */}
      <Modal isOpen={installModal} onClose={() => setInstallModal(false)} title="Mulai Instalasi Software Baru">
        <form onSubmit={handleInstallSoftwareSubmit} className="space-y-4">
          <Select
            label="Pilih Komputer Workstation"
            options={computers.map((c) => ({ value: c.id, label: c.computer_name }))}
            value={installForm.computer_id}
            onChange={(e) => setInstallForm((p) => ({ ...p, computer_id: e.target.value }))}
          />
          <Select
            label="Pilih Software dari Katalog"
            options={catalog.map((sw) => ({ value: sw.id, label: `${sw.software_name} (v${sw.version})` }))}
            value={installForm.software_id}
            onChange={(e) => setInstallForm((p) => ({ ...p, software_id: e.target.value }))}
          />
          <Input
            label="Tanggal Instalasi"
            type="date"
            value={installForm.installed_date}
            onChange={(e) => setInstallForm((p) => ({ ...p, installed_date: e.target.value }))}
            required
          />
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setInstallModal(false)}>Batal</Button>
            <Button type="submit" variant="primary" icon={<Laptop className="w-4 h-4" />}>Catat Instalasi</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SoftwareList;
