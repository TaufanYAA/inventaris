import React, { useState, useEffect } from 'react';
import { db } from '../supabaseClient';
import { 
  Search, 
  Filter, 
  Cpu, 
  Layers, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Settings2,
  X,
  Plus
} from 'lucide-react';

export default function PcInventory() {
  const [pcs, setPcs] = useState([]);
  const [filteredPcs, setFilteredPcs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter State
  const [search, setSearch] = useState('');
  const [selectedLab, setSelectedLab] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  
  // Modal State
  const [selectedPc, setSelectedPc] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);
  const [issueReport, setIssueReport] = useState('');

  const loadPcs = async () => {
    setLoading(true);
    try {
      const data = await db.getPCs();
      setPcs(data);
      setFilteredPcs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPcs();
  }, []);

  // Filter application
  useEffect(() => {
    let result = pcs;

    if (search.trim() !== '') {
      const term = search.toLowerCase();
      result = result.filter(pc => 
        pc.id.toLowerCase().includes(term) || 
        pc.name.toLowerCase().includes(term) || 
        pc.ipAddress.includes(term)
      );
    }

    if (selectedLab !== 'All') {
      result = result.filter(pc => pc.lab === selectedLab);
    }

    if (selectedStatus !== 'All') {
      result = result.filter(pc => pc.status === selectedStatus);
    }

    setFilteredPcs(result);
  }, [search, selectedLab, selectedStatus, pcs]);

  const handleOpenDetail = (pc) => {
    setSelectedPc(pc);
    setEditStatus(pc.status);
    setIssueReport('');
  };

  const handleSaveChanges = async () => {
    if (!selectedPc) return;
    setSaving(true);
    try {
      // 1. Update status PC
      const updatedPc = await db.updatePC(selectedPc.id, { status: editStatus });
      
      // 2. Jika status diubah ke maintenance dan ada deskripsi issue, buat tiket baru
      if (editStatus === 'Maintenance' && issueReport.trim() !== '') {
        await db.addMaintenanceLog({
          pcId: selectedPc.id,
          description: issueReport,
          reporter: 'Superadmin (Sistem Inventaris)',
          reportDate: new Date().toISOString().split('T')[0],
          scheduledDate: new Date().toISOString().split('T')[0],
          technician: 'Belum Ditentukan',
          status: 'Pending',
          notes: ''
        });
      }

      // Reload
      await loadPcs();
      setSelectedPc(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Inventaris Workstation PC</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total 45 unit PC terdistribusi di Lab A (PC-01 s/d PC-25) dan Lab B (PC-26 s/d PC-45).</p>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Cari ID PC, nama, atau IP..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-600 transition-all text-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Filter Drops */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Lab Selection */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Layers size={14} className="text-slate-400" />
            <select
              value={selectedLab}
              onChange={(e) => setSelectedLab(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="All">Semua Lab</option>
              <option value="Lab A">Lab A</option>
              <option value="Lab B">Lab B</option>
            </select>
          </div>

          {/* Status Selection */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <Settings2 size={14} className="text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent border-none outline-none text-slate-700 dark:text-slate-300 font-medium"
            >
              <option value="All">Semua Status</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        </div>

      </div>

      {/* Grid PCs */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : filteredPcs.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-400 text-xs">Tidak ada PC yang cocok dengan filter pencarian.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredPcs.map(pc => {
            let statusColor = 'bg-emerald-500';
            let statusBg = 'bg-emerald-50 dark:bg-emerald-950/20';
            let statusBorder = 'border-emerald-200 dark:border-emerald-900/30';
            let statusTextColor = 'text-emerald-700 dark:text-emerald-400';

            if (pc.status === 'Offline') {
              statusColor = 'bg-slate-400 dark:bg-slate-600';
              statusBg = 'bg-slate-100 dark:bg-slate-800/40';
              statusBorder = 'border-slate-200 dark:border-slate-700';
              statusTextColor = 'text-slate-600 dark:text-slate-400';
            } else if (pc.status === 'Maintenance') {
              statusColor = 'bg-rose-500';
              statusBg = 'bg-rose-50 dark:bg-rose-950/20';
              statusBorder = 'border-rose-200 dark:border-rose-900/30';
              statusTextColor = 'text-rose-700 dark:text-rose-400';
            }

            return (
              <div 
                key={pc.id}
                onClick={() => handleOpenDetail(pc)}
                className="glass-panel glass-panel-hover rounded-2xl p-4 cursor-pointer flex flex-col justify-between h-36 border border-slate-200/50 dark:border-slate-700/50"
              >
                {/* Header PC */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{pc.id}</h3>
                    <p className="text-[10px] text-slate-400">{pc.lab}</p>
                  </div>
                  <span className={`w-2.5 h-2.5 rounded-full ${statusColor}`} />
                </div>

                {/* Specs Summary */}
                <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5 my-2">
                  <p className="truncate font-semibold text-slate-600 dark:text-slate-300">{pc.specs.cpu}</p>
                  <p>{pc.specs.ram} RAM • {pc.specs.gpu.includes('RTX') ? 'Dedicated GPU' : 'Integrated GPU'}</p>
                </div>

                {/* Footer PC */}
                <div className={`mt-auto px-2 py-0.5 rounded-lg border ${statusBg} ${statusBorder} text-center`}>
                  <span className={`text-[9px] font-bold ${statusTextColor}`}>{pc.status}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* PC Detail Modal */}
      {selectedPc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700/80 animate-scale-in flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-brand-500">{selectedPc.lab}</span>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">{selectedPc.name} ({selectedPc.id})</h3>
              </div>
              <button 
                onClick={() => setSelectedPc(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              
              {/* PC Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Specs */}
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/40">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Cpu size={14} className="text-brand-500" />
                    Spesifikasi Hardware
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <p><span className="font-semibold">Processor:</span> {selectedPc.specs.cpu}</p>
                    <p><span className="font-semibold">RAM:</span> {selectedPc.specs.ram}</p>
                    <p><span className="font-semibold">Penyimpanan:</span> {selectedPc.specs.storage}</p>
                    <p><span className="font-semibold">Kartu Grafis:</span> {selectedPc.specs.gpu}</p>
                  </div>
                </div>

                {/* Network Specs */}
                <div className="space-y-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/40">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers size={14} className="text-brand-500" />
                    Identitas & Jaringan
                  </h4>
                  <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <p><span className="font-semibold">IP Address:</span> {selectedPc.ipAddress}</p>
                    <p><span className="font-semibold">MAC Address:</span> {selectedPc.macAddress}</p>
                    <p><span className="font-semibold">OS Terpasang:</span> {selectedPc.os}</p>
                    <p><span className="font-semibold">Maint. Terakhir:</span> {selectedPc.lastMaintenance}</p>
                  </div>
                </div>
              </div>

              {/* Installed Software */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText size={14} className="text-brand-500" />
                  Software Terpasang
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedPc.software.map((sw, idx) => (
                    <span 
                      key={idx} 
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-600/30"
                    >
                      {sw}
                    </span>
                  ))}
                </div>
              </div>

              {/* Change Status Form */}
              <div className="p-4 bg-brand-50/20 dark:bg-slate-900/40 border border-brand-200/20 dark:border-slate-700 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Ubah Status & Laporkan Masalah</h4>
                
                <div className="grid grid-cols-3 gap-3">
                  {['Online', 'Offline', 'Maintenance'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStatus(st)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        editStatus === st
                          ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/10'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>

                {/* Deskripsi Masalah jika pilih Maintenance */}
                {editStatus === 'Maintenance' && (
                  <div className="space-y-1.5 animate-slide-in">
                    <label className="text-[11px] font-semibold text-slate-400">Deskripsi Kendala/Masalah (Akan terbit tiket baru):</label>
                    <textarea
                      rows={2}
                      placeholder="Contoh: Kipas berisik, crash BSOD saat rendering AutoCAD..."
                      value={issueReport}
                      onChange={(e) => setIssueReport(e.target.value)}
                      className="w-full p-3 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-brand-600 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/50">
              <button 
                type="button"
                onClick={() => setSelectedPc(null)}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
              <button 
                type="button"
                disabled={saving}
                onClick={handleSaveChanges}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-600/10 flex items-center gap-1.5"
              >
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
