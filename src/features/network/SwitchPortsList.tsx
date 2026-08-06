import React, { useState, useEffect } from 'react';
import { useNetworkDevices, useSwitchPorts, useUpdateSwitchPort } from './queries';
import { DataTable, Column } from '../../shared/components/ui/DataTable';
import { Badge } from '../../shared/components/ui/Badge';
import { Card } from '../../shared/components/ui/Card';
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';
import { Select } from '../../shared/components/ui/Select';
import { Input } from '../../shared/components/ui/Input';
import { useToast } from '../../shared/components/Toast';
import { supabase } from '../../lib/supabase';
import { Server, Settings, Zap, ZapOff, CheckCircle2, XCircle } from 'lucide-react';

const statusBadge = (status: string) => {
  const map: Record<string, any> = {
    'Up': 'success',
    'Down': 'default',
    'Disabled': 'danger',
  };
  return <Badge variant={map[status] || 'default'}>{status}</Badge>;
};

export const SwitchPortsList: React.FC = () => {
  const { toast } = useToast();
  const [selectedSwitchId, setSelectedSwitchId] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedPort, setSelectedPort] = useState<any>(null);

  // Lists for connection targets in edit form
  const [computers, setComputers] = useState<any[]>([]);
  const [networkDevices, setNetworkDevices] = useState<any[]>([]);

  // Edit form state
  const [editForm, setEditForm] = useState({
    port_status: 'Down' as const,
    vlan_id: 1,
    poe_enabled: false,
    connected_device_type: 'None' as const,
    connected_computer_id: null as string | null,
    connected_network_device_id: null as string | null,
    connected_patch_panel_port: '',
  });

  // Query all active devices to find switches
  const { data: devicesData } = useNetworkDevices();
  const switches = (devicesData?.data || []).filter((d: any) => d.device_type === 'Switch');

  // Set first switch as default if none selected
  useEffect(() => {
    if (switches.length > 0 && !selectedSwitchId) {
      setSelectedSwitchId(switches[0].id);
    }
  }, [switches, selectedSwitchId]);

  // Load computers & network devices for selection
  useEffect(() => {
    async function loadTargets() {
      const { data: compData } = await supabase.from('computers').select('id, computer_name').eq('deleted_at', null).order('computer_name');
      const { data: netData } = await supabase.from('network_devices').select('id, device_name').eq('deleted_at', null).order('device_name');
      if (compData) setComputers(compData);
      if (netData) setNetworkDevices(netData);
    }
    loadTargets();
  }, []);

  const { data: portsData, isLoading } = useSwitchPorts(selectedSwitchId);
  const { mutate: updatePort } = useUpdateSwitchPort();

  const ports = portsData || [];

  const handleOpenEdit = (port: any) => {
    setSelectedPort(port);
    setEditForm({
      port_status: port.port_status,
      vlan_id: port.vlan_id || 1,
      poe_enabled: port.poe_enabled || false,
      connected_device_type: port.connected_device_type,
      connected_computer_id: port.connected_computer_id,
      connected_network_device_id: port.connected_network_device_id,
      connected_patch_panel_port: port.connected_patch_panel_port || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPort) return;

    const payload = {
      ...editForm,
      connected_computer_id: editForm.connected_device_type === 'Computer' ? editForm.connected_computer_id : null,
      connected_network_device_id: editForm.connected_device_type === 'Network Device' ? editForm.connected_network_device_id : null,
      connected_patch_panel_port: editForm.connected_patch_panel_port || null,
    };

    updatePort({ id: selectedPort.id, data: payload }, {
      onSuccess: () => {
        toast('success', `Port ${selectedPort.port_name} berhasil diperbarui.`);
        setEditModalOpen(false);
      },
      onError: (err: any) => toast('error', err.message || 'Gagal memperbarui port.'),
    });
  };

  const columns: Column<any>[] = [
    {
      header: 'Nama Port',
      accessor: (row) => (
        <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-100">
          {row.port_name}
        </span>
      ),
    },
    {
      header: 'Speed',
      accessor: (row) => (
        <span className="text-xs text-slate-500 font-semibold">{row.port_speed || '1 Gbps'}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => statusBadge(row.port_status),
    },
    {
      header: 'VLAN',
      accessor: (row) => (
        <Badge variant="indigo">VLAN {row.vlan_id || 1}</Badge>
      ),
    },
    {
      header: 'PoE Status',
      accessor: (row) => (
        row.poe_supported ? (
          row.poe_enabled ? (
            <span className="flex items-center gap-1 text-xs text-amber-500 font-bold"><Zap className="w-3.5 h-3.5 fill-current" /> Active</span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-slate-400"><ZapOff className="w-3.5 h-3.5" /> Supported</span>
          )
        ) : (
          <span className="text-xs text-slate-300 dark:text-slate-700">Not Supported</span>
        )
      ),
    },
    {
      header: 'Koneksi Device',
      accessor: (row) => {
        if (row.connected_device_type === 'Computer') {
          return <span className="text-sm font-medium text-slate-700 dark:text-slate-300">💻 PC: {row.connected_computer?.computer_name || 'PC (Unknown)'}</span>;
        }
        if (row.connected_device_type === 'Network Device') {
          return <span className="text-sm font-medium text-slate-700 dark:text-slate-300">🌐 Net: {row.connected_network_device?.device_name || 'Device (Unknown)'}</span>;
        }
        return <span className="text-xs italic text-slate-300 dark:text-slate-600">Empty</span>;
      },
    },
    {
      header: 'Patch Panel Port',
      accessor: (row) => (
        <span className="font-mono text-xs text-slate-500">{row.connected_patch_panel_port || '—'}</span>
      ),
    },
    {
      header: 'Aksi',
      accessor: (row) => (
        <Button
          variant="outline"
          size="sm"
          icon={<Settings className="w-3.5 h-3.5" />}
          onClick={() => handleOpenEdit(row)}
        >
          Configure
        </Button>
      ),
    },
  ];

  // Port layout stats
  const upPorts = ports.filter((p: any) => p.port_status === 'Up').length;
  const downPorts = ports.filter((p: any) => p.port_status === 'Down').length;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Switch Ports Mapping
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pemetaan kabel jaringan patch panel ke switch port core dan status link masing-masing.
          </p>
        </div>
        <div className="w-64">
          <Select
            label="Pilih Switch Perangkat"
            options={switches.map((sw: any) => ({ value: sw.id, label: sw.device_name }))}
            value={selectedSwitchId}
            onChange={(e) => setSelectedSwitchId(e.target.value)}
          />
        </div>
      </div>

      {/* PORT SPEED/LINK MATRIX PANEL */}
      {ports.length > 0 && (
        <Card className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"><Server className="w-4 h-4" /> Switch Port Matrix View</h2>
            <div className="flex gap-4 text-xs">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Up ({upPorts})</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-300 dark:bg-slate-700 inline-block" /> Down ({downPorts})</span>
            </div>
          </div>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
            {ports.map((port: any) => (
              <div
                key={port.id}
                onClick={() => handleOpenEdit(port)}
                className={`p-2.5 border rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:scale-105 ${
                  port.port_status === 'Up'
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                    : port.port_status === 'Disabled'
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/20'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900'
                }`}
              >
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono font-bold leading-none mb-1">
                  {port.port_name}
                </span>
                {port.port_status === 'Up' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-slate-300 dark:text-slate-700" />
                )}
                <span className="text-[9px] text-slate-500 mt-1 font-semibold">V{port.vlan_id || 1}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TABLE */}
      <DataTable
        columns={columns}
        data={ports}
        loading={isLoading && !!selectedSwitchId}
        emptyTitle="Tidak Ada Ports"
        emptyDescription="Pilih switch untuk menampilkan daftar port."
        page={1}
        pageSize={100}
        totalCount={ports.length}
        onPageChange={() => {}}
      />

      {/* CONFIGURE MODAL */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title={selectedPort ? `Configure Port: ${selectedPort.port_name}` : ''}>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Port Status"
              options={[
                { value: 'Up', label: 'Up' },
                { value: 'Down', label: 'Down' },
                { value: 'Disabled', label: 'Disabled' },
              ]}
              value={editForm.port_status}
              onChange={(e) => setEditForm((p) => ({ ...p, port_status: e.target.value as any }))}
            />
            <Input
              label="VLAN ID"
              type="number"
              value={editForm.vlan_id.toString()}
              onChange={(e) => setEditForm((p) => ({ ...p, vlan_id: Number(e.target.value) }))}
              required
            />
          </div>

          {selectedPort?.poe_supported && (
            <div className="flex items-center gap-2 py-2 border-y border-slate-100 dark:border-slate-800">
              <input
                type="checkbox"
                id="poe_enabled"
                checked={editForm.poe_enabled}
                onChange={(e) => setEditForm((p) => ({ ...p, poe_enabled: e.target.checked }))}
                className="w-4 h-4 rounded text-sky-500 border-slate-300 focus:ring-sky-500"
              />
              <label htmlFor="poe_enabled" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Enable PoE (Power over Ethernet)</label>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Connected Device Type"
              options={[
                { value: 'None', label: 'None' },
                { value: 'Computer', label: 'Computer (PC)' },
                { value: 'Network Device', label: 'Network Device' },
              ]}
              value={editForm.connected_device_type}
              onChange={(e) => setEditForm((p) => ({ ...p, connected_device_type: e.target.value as any }))}
            />
            <Input
              label="Patch Panel Port ID"
              value={editForm.connected_patch_panel_port}
              onChange={(e) => setEditForm((p) => ({ ...p, connected_patch_panel_port: e.target.value }))}
              placeholder="e.g. PP-01-Port-12"
            />
          </div>

          {editForm.connected_device_type === 'Computer' && (
            <Select
              label="Select Connected PC"
              options={computers.map((c) => ({ value: c.id, label: c.computer_name }))}
              value={editForm.connected_computer_id || ''}
              onChange={(e) => setEditForm((p) => ({ ...p, connected_computer_id: e.target.value }))}
            />
          )}

          {editForm.connected_device_type === 'Network Device' && (
            <Select
              label="Select Connected Device"
              options={networkDevices.map((d) => ({ value: d.id, label: d.device_name }))}
              value={editForm.connected_network_device_id || ''}
              onChange={(e) => setEditForm((p) => ({ ...p, connected_network_device_id: e.target.value }))}
            />
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setEditModalOpen(false)}>Batal</Button>
            <Button type="submit" variant="primary">Simpan Konfigurasi</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SwitchPortsList;
