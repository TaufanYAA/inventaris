import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useComputer, useComputerHistory, useSwapHardware, useUpdateComputer } from './queries';
import { useCreateTicket } from '../maintenance/queries';
import { Card } from '../../shared/components/ui/Card';
import { Badge } from '../../shared/components/ui/Badge';
import { Button } from '../../shared/components/ui/Button';
import { Input } from '../../shared/components/ui/Input';
import { Select } from '../../shared/components/ui/Select';
import { Modal } from '../../shared/components/ui/Modal';
import { LoadingState } from '../../shared/components/ui/LoadingState';
import { useToast } from '../../shared/components/Toast';
import { useAuth } from '../auth/AuthContext';
import {
  ArrowLeft,
  Cpu,
  Network,
  Wrench,
  ShieldCheck,
  FileCode2,
  QrCode,
  Calendar,
  User,
  Plus,
  RefreshCw,
  Info,
  Server,
  Monitor,
  Wrench as WrenchIcon
} from 'lucide-react';
import { Database } from '../../types/database.types';

export const ComputerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: computer, isLoading: compLoading, refetch: refetchComp } = useComputer(id || '');
  const { data: history, isLoading: historyLoading, refetch: refetchHistory } = useComputerHistory(id || '');

  // Mutator actions
  const { mutate: updateComputer } = useUpdateComputer();
  const { mutate: swapHardware } = useSwapHardware();
  const { mutate: createTicket } = useCreateTicket();

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [ticketModalOpen, setTicketModalOpen] = useState(false);

  // Edit computer form state
  const [editForm, setEditForm] = useState({
    processor: '',
    motherboard: '',
    ram: '',
    storage: '',
    gpu: '',
    condition: 'Baik' as any,
    status: 'Aktif' as any,
  });

  // Swap component form state
  const [swapForm, setSwapForm] = useState({
    component_type: 'RAM',
    previous_model: '',
    new_model: '',
    serial_number_removed: '',
    serial_number_added: '',
    change_reason: '',
  });

  // Ticket complaint form state
  const [ticketForm, setTicketForm] = useState({
    complaint_details: '',
  });

  // Initialize edit forms when computer loads
  React.useEffect(() => {
    if (computer) {
      setEditForm({
        processor: computer.processor || '',
        motherboard: computer.motherboard || '',
        ram: computer.ram || '',
        storage: computer.storage || '',
        gpu: computer.gpu || '',
        condition: computer.condition,
        status: computer.status,
      });

      // Pre-fill previous model based on current selection in swap form
      const prefillPrevModel = (type: string) => {
        if (type === 'CPU') return computer.processor || '';
        if (type === 'RAM') return computer.ram || '';
        if (type === 'Storage') return computer.storage || '';
        if (type === 'GPU') return computer.gpu || '';
        return '';
      };

      setSwapForm(prev => ({
        ...prev,
        previous_model: prefillPrevModel(prev.component_type),
      }));
    }
  }, [computer]);

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    updateComputer(
      { id, data: editForm },
      {
        onSuccess: () => {
          toast('success', 'Spesifikasi komputer berhasil diperbarui.');
          setEditModalOpen(false);
          refetchComp();
        },
      }
    );
  };

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user) return;

    // Map component selection to computers table field names
    let specField: 'processor' | 'motherboard' | 'ram' | 'storage' | 'gpu' = 'ram';
    if (swapForm.component_type === 'CPU') specField = 'processor';
    if (swapForm.component_type === 'Storage') specField = 'storage';
    if (swapForm.component_type === 'GPU') specField = 'gpu';

    const insertHistoryData = {
      computer_id: id,
      component_type: swapForm.component_type,
      previous_model: swapForm.previous_model,
      new_model: swapForm.new_model,
      serial_number_removed: swapForm.serial_number_removed || null,
      serial_number_added: swapForm.serial_number_added || null,
      technician_id: user.id,
      change_reason: swapForm.change_reason,
      change_date: new Date().toISOString().split('T')[0],
    };

    swapHardware(
      { computerId: id, historyData: insertHistoryData as any, specField },
      {
        onSuccess: () => {
          toast('success', `Upgrade komponen ${swapForm.component_type} berhasil dicatat.`);
          setSwapModalOpen(false);
          refetchComp();
          refetchHistory();
        },
        onError: (err: any) => {
          toast('error', err.message || 'Gagal merekam penggantian hardware.');
        },
      }
    );
  };

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !user || !computer) return;

    const ticketData = {
      reporter_name: user.fullName,
      reporter_id: user.id,
      reporter_phone: '0812-3456-7890',
      laboratory_id: computer.laboratory_id,
      computer_id: id,
      complaint_details: ticketForm.complaint_details,
      ticket_status: 'Open',
    };

    createTicket(ticketData, {
      onSuccess: () => {
        toast('success', 'Laporan kendala berhasil dikirim ke antrean tiket perbaikan.');
        setTicketModalOpen(false);
        setTicketForm({ complaint_details: '' });
        
        // Temporarily flag PC condition as Maintenance in client view
        updateComputer({ id, data: { condition: 'Maintenance' } });
        refetchComp();
      },
    });
  };

  if (compLoading || historyLoading) {
    return <LoadingState />;
  }

  if (!computer) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-bold text-rose-500">Komputer tidak ditemukan</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('/computers')}>
          Kembali ke daftar
        </Button>
      </div>
    );
  }

  // Dynamic network mapper based on lab name & PC index
  const getNetworkDetails = () => {
    if (!computer) return { ip: '—', gateway: '—', vlan: '—' };
    const labName = (computer as any).laboratory?.lab_name || '';
    let subnet = '10';
    let vlan = '10';
    if (labName.includes('Lab B') || labName.includes('LAB B')) { subnet = '20'; vlan = '20'; }
    else if (labName.includes('Lab C') || labName.includes('LAB C')) { subnet = '30'; vlan = '30'; }
    else if (labName.includes('Lab D') || labName.includes('LAB D')) { subnet = '40'; vlan = '40'; }
    else if (labName.includes('Lab E') || labName.includes('LAB E')) { subnet = '50'; vlan = '50'; }
    else if (labName.includes('Lab F') || labName.includes('LAB F')) { subnet = '60'; vlan = '60'; }
    
    const pcNum = computer.computer_name.split('-')[1] || '0';
    return {
      ip: `192.168.${subnet}.${10 + Number(pcNum)}`,
      gateway: `192.168.${subnet}.1`,
      vlan: `VLAN ${vlan}`
    };
  };

  const net = getNetworkDetails();

  // Pre-seed mock warranty for visualization
  const mockWarranty = {
    number: `WAR-LG-MON-${computer.computer_name}`,
    vendor: 'CV. Jaya Raya Mandiri',
    start: '10 Januari 2026',
    end: '10 Januari 2029',
    pic: 'Roni Wijaya (Warranty PIC)',
  };

  // Mock software mappings
  const mockSoftware = [
    { name: 'Windows 11 Pro Education', version: '23H2', type: 'KMS Lic', status: 'Active' },
    { name: 'Microsoft Office LTSC 2021', version: '16.0', type: 'KMS Lic', status: 'Active' },
    { name: 'VS Code', version: '1.86', type: 'FOSS', status: 'Active' },
    { name: 'AutoCAD 2024 (Lab License)', version: '24.3', type: 'EDU Sub', status: 'Active' },
  ];

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/computers')}
          className="p-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detail Workstation</span>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white leading-tight">{computer.computer_name}</h1>
        </div>
      </div>

      {/* TOP SUMMARY PANEL */}
      <Card className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Simulated PC visual asset placeholder */}
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center border border-slate-300/30 text-slate-500">
            <Monitor className="w-12 h-12" />
          </div>

          <div className="space-y-2 text-center md:text-left">
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <Badge>{computer.condition}</Badge>
              <Badge>{computer.status}</Badge>
              <Badge variant="indigo">
                {(computer as any).laboratory?.lab_name || 'Tidak Ada Lab'}
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Sistem Operasi: <span className="font-semibold text-slate-700 dark:text-slate-200">{computer.operating_system}</span>
            </p>
            <p className="text-xs text-slate-400">
              Lokasi: {(computer as any).laboratory?.room?.room_name || '—'}
            </p>
          </div>
        </div>

        {/* QR Code and Actions */}
        <div className="flex items-center gap-6 border-t md:border-t-0 md:border-l border-slate-200/50 dark:border-slate-800/50 pt-6 md:pt-0 md:pl-6 w-full md:w-auto">
          {/* Custom QR visual element */}
          <div className="flex flex-col items-center gap-1.5 p-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <QrCode className="w-16 h-16 text-slate-800" />
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">QR Code Aset</span>
          </div>

          <div className="flex-1 flex flex-col gap-2.5">
            {user && ['Admin', 'Teknisi'].includes(user.role) && (
              <>
                <Button variant="primary" size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setSwapModalOpen(true)}>
                  Ubah Komponen (Swap)
                </Button>
                <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={() => setEditModalOpen(true)}>
                  Update Spek
                </Button>
              </>
            )}
            <Button variant="danger" size="sm" icon={<Wrench className="w-4 h-4" />} onClick={() => setTicketModalOpen(true)}>
              Laporkan Kendala
            </Button>
          </div>
        </div>
      </Card>

      {/* CORE SPECIFICATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Hardware specifications list */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <Cpu className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-base text-slate-800 dark:text-white">Spesifikasi Hybrid Hardware</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 block uppercase">Processor (CPU)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{computer.processor || 'Tidak Terpasang'}</span>
            </div>
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-400 block uppercase">Motherboard</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{computer.motherboard || 'Tidak Terpasang'}</span>
            </div>
            <div className="space-y-1.5 border-t border-slate-50 dark:border-slate-900 pt-3 sm:border-t-0 sm:pt-0">
              <span className="text-xs font-bold text-slate-400 block uppercase">RAM Memory</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{computer.ram || 'Tidak Terpasang'}</span>
            </div>
            <div className="space-y-1.5 border-t border-slate-50 dark:border-slate-900 pt-3 sm:border-t-0 sm:pt-0">
              <span className="text-xs font-bold text-slate-400 block uppercase">SSD Storage</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{computer.storage || 'Tidak Terpasang'}</span>
            </div>
            <div className="space-y-1.5 border-t border-slate-50 dark:border-slate-900 pt-3 sm:col-span-2">
              <span className="text-xs font-bold text-slate-400 block uppercase">Graphics Card (GPU)</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{computer.gpu || 'UHD Integrated Graphics'}</span>
            </div>
            <div className="space-y-1.5 border-t border-slate-50 dark:border-slate-900 pt-3 sm:col-span-2">
              <span className="text-xs font-bold text-slate-400 block uppercase">Monitor Device Specs</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {computer.monitor_brand} {computer.monitor_model} (Serial: {computer.monitor_serial || 'N/A'})
              </span>
            </div>
            <div className="space-y-1.5 border-t border-slate-50 dark:border-slate-900 pt-3 sm:col-span-2">
              <span className="text-xs font-bold text-slate-400 block uppercase">Peripherals Details</span>
              <span className="font-semibold text-slate-700 dark:text-slate-200">{computer.peripheral_details || 'Generic USB Keyboard + Mouse'}</span>
            </div>
          </div>
        </Card>

        {/* Network & IPAM details card */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <Network className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base text-slate-800 dark:text-white">Alokasi Jaringan (IPAM)</h3>
          </div>
          
          <div className="space-y-4 text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="font-bold text-slate-500">IP Address</span>
              <span className="font-semibold text-sky-500 font-mono text-sm bg-sky-50 dark:bg-sky-950/30 px-2.5 py-1 rounded-lg">
                {net.ip}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50 dark:border-slate-850">
              <span className="font-bold text-slate-500">Subnet Mask</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">255.255.255.0</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50 dark:border-slate-850">
              <span className="font-bold text-slate-500">Gateway Address</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                {net.gateway}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50 dark:border-slate-850">
              <span className="font-bold text-slate-500">DNS Servers</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">8.8.8.8, 1.1.1.1</span>
            </div>
            <div className="flex justify-between items-center py-1 border-t border-slate-50 dark:border-slate-850">
              <span className="font-bold text-slate-500">Switch Port</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                Cisco Catalyst • Port Gi0/{Number(computer.computer_name.split('-')[1]) % 24 + 1}
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* LOWER PANEL: SOFTWARE, MAINTENANCE TIMELINE, & COMPONENT HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Installed Software panel */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <FileCode2 className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base text-slate-800 dark:text-white">Software Terpasang</h3>
          </div>
          <div className="space-y-3.5">
            {mockSoftware.map((sw, index) => (
              <div key={index} className="flex justify-between items-start gap-4 text-xs py-1">
                <div>
                  <p className="font-bold text-slate-700 dark:text-slate-200">{sw.name}</p>
                  <p className="text-[10px] text-slate-400">Versi: {sw.version} • {sw.type}</p>
                </div>
                <Badge>{sw.status}</Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Maintenance / Ticket Timeline */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <WrenchIcon className="w-5 h-5 text-sky-500" />
            <h3 className="font-bold text-base text-slate-800 dark:text-white">CMMS Maintenance Timeline</h3>
          </div>
          
          <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-6 space-y-6 text-xs">
            {/* Timeline Row 1: Today BSOD ticket */}
            {computer.condition === 'Maintenance' && (
              <div className="relative">
                <span className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border border-white dark:border-slate-900 bg-rose-500 shadow-sm flex items-center justify-center text-white"></span>
                <span className="font-bold text-rose-500 block mb-0.5">HARI INI</span>
                <p className="text-slate-700 dark:text-slate-300 font-semibold">Tiket Aduan Baru Terbuka</p>
                <p className="text-slate-400 text-[10px] mt-0.5">PC BSOD acak ketika merender visualisasi program.</p>
              </div>
            )}

            {/* Timeline Row 2: Repaste Noctua */}
            <div className="relative">
              <span className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border border-white dark:border-slate-900 bg-sky-500 shadow-sm"></span>
              <span className="font-bold text-slate-500 block mb-0.5">20 JULI 2026</span>
              <p className="text-slate-700 dark:text-slate-300 font-semibold">Repaste Thermal Processor</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Suhu kerja CPU diturunkan. Re-paste dengan Noctua NT-H1.</p>
            </div>

            {/* Timeline Row 3: Casing Cleaning */}
            <div className="relative">
              <span className="absolute -left-[30px] top-0.5 w-4 h-4 rounded-full border border-white dark:border-slate-900 bg-emerald-500 shadow-sm"></span>
              <span className="font-bold text-slate-500 block mb-0.5">15 JULI 2026</span>
              <p className="text-slate-700 dark:text-slate-300 font-semibold">Pembersihan Debu Workstation</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Perawatan triwulanan preventif diselesaikan oleh teknisi.</p>
            </div>
          </div>
        </Card>

        {/* Hardware components history panel */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
            <RefreshCw className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base text-slate-800 dark:text-white">Audit Log Komponen</h3>
          </div>
          
          {history && history.length > 0 ? (
            <div className="space-y-4 text-xs">
              {history.map((item, idx) => (
                <div key={idx} className="p-3 border border-slate-200/50 dark:border-slate-850 rounded-xl bg-slate-50/50 dark:bg-slate-950/20 space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Badge variant="indigo">{item.component_type}</Badge>
                    <span className="text-[10px] text-slate-400">{item.change_date}</span>
                  </div>
                  <p className="font-bold text-slate-700 dark:text-slate-300">
                    {item.previous_model} &rarr; {item.new_model}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-normal">Alasan: {item.change_reason}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-400 text-xs">
              Belum ada riwayat penggantian komponen hardware di PC ini.
            </div>
          )}

          {/* Warranty panel */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-850 space-y-3.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-500" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">Warranty & Vendor Info</h4>
            </div>
            
            <div className="space-y-2 text-xs text-slate-500">
              <p>Supplier: <span className="font-semibold text-slate-700 dark:text-slate-200">{mockWarranty.vendor}</span></p>
              <p>Masa Garansi: <span className="font-semibold text-slate-700 dark:text-slate-200">{mockWarranty.start} s/d {mockWarranty.end}</span></p>
              <p>Nomor Warranty: <span className="font-mono text-slate-700 dark:text-slate-350">{mockWarranty.number}</span></p>
            </div>
          </div>
        </Card>
      </div>

      {/* UPDATE SPECIFICATIONS MODAL */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Update Spesifikasi Komputer ${computer.computer_name}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <Input
            label="Processor CPU"
            value={editForm.processor}
            onChange={e => setEditForm(prev => ({ ...prev, processor: e.target.value }))}
          />
          <Input
            label="Motherboard"
            value={editForm.motherboard}
            onChange={e => setEditForm(prev => ({ ...prev, motherboard: e.target.value }))}
          />
          <Input
            label="RAM Memory"
            value={editForm.ram}
            onChange={e => setEditForm(prev => ({ ...prev, ram: e.target.value }))}
          />
          <Input
            label="Storage SSD"
            value={editForm.storage}
            onChange={e => setEditForm(prev => ({ ...prev, storage: e.target.value }))}
          />
          <Input
            label="Kartu Grafis GPU"
            value={editForm.gpu}
            onChange={e => setEditForm(prev => ({ ...prev, gpu: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Kondisi Perangkat"
              options={[
                { value: 'Baik', label: 'Baik' },
                { value: 'Maintenance', label: 'Maintenance' },
                { value: 'Rusak Ringan', label: 'Rusak Ringan' },
                { value: 'Rusak Berat', label: 'Rusak Berat' },
              ]}
              value={editForm.condition}
              onChange={e => setEditForm(prev => ({ ...prev, condition: e.target.value as any }))}
            />
            <Select
              label="Status Perangkat"
              options={[
                { value: 'Aktif', label: 'Aktif' },
                { value: 'Nonaktif', label: 'Nonaktif' },
                { value: 'Cadangan', label: 'Cadangan' },
              ]}
              value={editForm.status}
              onChange={e => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Simpan Perubahan
            </Button>
          </div>
        </form>
      </Modal>

      {/* SWAP HARDWARE LOG MODAL */}
      <Modal
        isOpen={swapModalOpen}
        onClose={() => setSwapModalOpen(false)}
        title="Catat Penggantian Hardware (Component Swap)"
      >
        <form onSubmit={handleSwapSubmit} className="space-y-4">
          <Select
            label="Pilih Jenis Komponen"
            options={[
              { value: 'CPU', label: 'Processor CPU' },
              { value: 'RAM', label: 'RAM Memory' },
              { value: 'Storage', label: 'SSD Storage' },
              { value: 'GPU', label: 'Graphics Card (GPU)' },
            ]}
            value={swapForm.component_type}
            onChange={e => {
              const type = e.target.value;
              let prev = '';
              if (type === 'CPU') prev = computer.processor || '';
              if (type === 'RAM') prev = computer.ram || '';
              if (type === 'Storage') prev = computer.storage || '';
              if (type === 'GPU') prev = computer.gpu || '';

              setSwapForm(prevForm => ({
                ...prevForm,
                component_type: type,
                previous_model: prev,
              }));
            }}
          />

          <Input
            label="Model Komponen Lama"
            value={swapForm.previous_model}
            onChange={e => setSwapForm(prev => ({ ...prev, previous_model: e.target.value }))}
            disabled
          />
          <Input
            label="Model Komponen Baru (Upgrade/Replacement)"
            value={swapForm.new_model}
            onChange={e => setSwapForm(prev => ({ ...prev, new_model: e.target.value }))}
            placeholder="e.g. Corsair Vengeance 16GB DDR4 (Single)"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Serial Number Dilepas"
              value={swapForm.serial_number_removed}
              onChange={e => setSwapForm(prev => ({ ...prev, serial_number_removed: e.target.value }))}
              placeholder="e.g. SN-OLD-123"
            />
            <Input
              label="Serial Number Dipasang"
              value={swapForm.serial_number_added}
              onChange={e => setSwapForm(prev => ({ ...prev, serial_number_added: e.target.value }))}
              placeholder="e.g. SN-NEW-456"
            />
          </div>

          <Input
            label="Alasan Penggantian"
            value={swapForm.change_reason}
            onChange={e => setSwapForm(prev => ({ ...prev, change_reason: e.target.value }))}
            placeholder="e.g. Upgrade kapasitas RAM praktikum AI, kerusakan chip, dll."
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setSwapModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Catat Swap Hardware
            </Button>
          </div>
        </form>
      </Modal>

      {/* REPORT COMPLAINT TICKET MODAL */}
      <Modal
        isOpen={ticketModalOpen}
        onClose={() => setTicketModalOpen(false)}
        title="Laporkan Kendala PC (Submit Complaint Ticket)"
      >
        <form onSubmit={handleTicketSubmit} className="space-y-4">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 rounded-xl text-rose-800 dark:text-rose-400 text-xs flex gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>Membuat tiket aduan baru akan otomatis mengubah status visual komputer di Dashboard menjadi <strong>Maintenance</strong> agar terpantau oleh teknisi NOC.</span>
          </div>

          <Input
            label="Detail Laporan Kerusakan / Gangguan"
            value={ticketForm.complaint_details}
            onChange={e => setTicketForm(prev => ({ ...prev, complaint_details: e.target.value }))}
            placeholder="e.g. Layar berkedip berulang, sistem operasi macet (freeze), slot USB mati, dll."
            required
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setTicketModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Kirim Tiket Aduan
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
export default ComputerDetail;
