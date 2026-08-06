import React, { useState, useEffect } from 'react';
import { db } from '../supabaseClient';
import { 
  Wrench, 
  Plus, 
  Clock, 
  Play, 
  CheckCircle2, 
  User, 
  Calendar,
  MessageSquare,
  X
} from 'lucide-react';

export default function MaintenanceSchedule() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New ticket state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPcId, setNewPcId] = useState('PC-01');
  const [newDescription, setNewDescription] = useState('');
  const [newReporter, setNewReporter] = useState('');
  const [newTechnician, setNewTechnician] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Note update state
  const [updatingLog, setUpdatingLog] = useState(null);
  const [updateNotes, setUpdateNotes] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await db.getMaintenanceLogs();
      setLogs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleAddLog = async (e) => {
    e.preventDefault();
    if (newDescription.trim() === '' || newReporter.trim() === '') return;
    setSubmitting(true);
    try {
      const newLog = {
        pcId: newPcId,
        description: newDescription,
        reporter: newReporter,
        reportDate: new Date().toISOString().split('T')[0],
        scheduledDate: new Date().toISOString().split('T')[0],
        technician: newTechnician.trim() !== '' ? newTechnician : 'Belum Ditentukan',
        status: 'Pending',
        notes: ''
      };

      // Tambah log pemeliharaan
      await db.addMaintenanceLog(newLog);

      // Ubah status PC target menjadi Maintenance
      await db.updatePC(newPcId, { status: 'Maintenance' });

      // Reset form
      setNewPcId('PC-01');
      setNewDescription('');
      setNewReporter('');
      setNewTechnician('');
      setShowAddForm(false);
      
      // Reload logs
      await loadLogs();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenUpdate = (log) => {
    setUpdatingLog(log);
    setUpdateNotes(log.notes);
    setUpdateStatus(log.status);
  };

  const handleSaveUpdate = async () => {
    if (!updatingLog) return;
    setUpdating(true);
    try {
      const fields = {
        status: updateStatus,
        notes: updateNotes
      };

      await db.updateMaintenanceLog(updatingLog.id, fields);

      // INTEGRASI: Jika diubah ke 'Resolved', kembalikan status PC ke 'Online'
      if (updateStatus === 'Resolved') {
        await db.updatePC(updatingLog.pcId, { status: 'Online' });
      } else if (updateStatus === 'In Progress' || updateStatus === 'Pending') {
        await db.updatePC(updatingLog.pcId, { status: 'Maintenance' });
      }

      await loadLogs();
      setUpdatingLog(null);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Jadwal & Log Perbaikan</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Kelola tiket troubleshooting hardware dan software workstation laboratorium secara real-time.</p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/15"
        >
          <Plus size={15} />
          <span>Laporkan Kendala Baru</span>
        </button>
      </div>

      {/* Main List Logs */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : logs.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
          <p className="text-slate-400 text-xs">Belum ada riwayat perbaikan yang terdaftar.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map(log => {
            // Status design
            let statusIcon = Clock;
            let statusStyle = 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30';
            
            if (log.status === 'In Progress') {
              statusIcon = Play;
              statusStyle = 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30';
            } else if (log.status === 'Resolved') {
              statusIcon = CheckCircle2;
              statusStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30';
            }

            const StatusIcon = statusIcon;

            return (
              <div 
                key={log.id} 
                className="glass-panel rounded-2xl p-5 border border-slate-200/50 dark:border-slate-700/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left section: ID PC & Deskripsi */}
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 text-white font-bold text-[10px] uppercase">
                      {log.pcId}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Tiket ID: {log.id}</span>
                    <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full flex items-center gap-1.5 ${statusStyle}`}>
                      <StatusIcon size={11} />
                      {log.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-relaxed">{log.description}</h3>
                  
                  {log.notes && (
                    <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800/40 text-[11px] text-slate-500 dark:text-slate-400 flex items-start gap-1.5 leading-normal">
                      <MessageSquare size={13} className="text-slate-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <strong className="text-slate-600 dark:text-slate-300">Catatan Teknik: </strong>
                        {log.notes}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right section: Reporter, Tech, Date & Action */}
                <div className="flex flex-wrap items-center md:flex-col md:items-end justify-between md:justify-center gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100 dark:border-slate-700">
                  
                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 md:flex md:flex-col gap-x-4 gap-y-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-slate-400" />
                      <span>Teknisi: <strong className="text-slate-700 dark:text-slate-300">{log.technician}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} className="text-slate-400" />
                      <span>Pelaporan: <strong className="text-slate-700 dark:text-slate-300">{log.reportDate}</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => handleOpenUpdate(log)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-all border border-slate-200/50 dark:border-slate-600/35"
                  >
                    Update Tiket
                  </button>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add Ticket Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-md animate-fade-in">
          <form 
            onSubmit={handleAddLog}
            className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700/80 animate-scale-in"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Wrench size={16} className="text-brand-500" />
                Laporkan Kerusakan PC
              </h3>
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs">
              
              {/* Select Target PC */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Pilih Workstation PC Target:</label>
                <select
                  value={newPcId}
                  onChange={(e) => setNewPcId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100 font-semibold"
                >
                  {Array.from({ length: 45 }, (_, i) => {
                    const id = `PC-${(i + 1).toString().padStart(2, '0')}`;
                    return <option key={id} value={id}>{id} (Lab {i < 25 ? 'A' : 'B'})</option>;
                  })}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Deskripsi Kendala/Masalah:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Kipas bising, layar mati (no signal), tidak bisa terhubung internet lab..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Reporter */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Nama Pelapor (Dosen/Mahasiswa/Asisten):</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ibu Ranti (Dosen Jaringan), atau Budi (Asisten Lab)"
                  value={newReporter}
                  onChange={(e) => setNewReporter(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Assigned Tech */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Teknisi Penanggung Jawab (Opsional):</label>
                <input
                  type="text"
                  placeholder="Contoh: Rian H., Ferry K. (Kosongkan jika belum ada)"
                  value={newTechnician}
                  onChange={(e) => setNewTechnician(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50">
              <button 
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Batal
              </button>
              <button 
                type="submit"
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-md shadow-brand-600/10"
              >
                {submitting ? 'Mengirim...' : 'Kirim Laporan'}
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Update Ticket Status/Notes Modal */}
      {updatingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700/80 animate-scale-in">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">Update Tiket Pemeliharaan ({updatingLog.id})</h3>
              <button 
                onClick={() => setUpdatingLog(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-400 font-medium">Workstation Target:</span>
                <p className="font-bold text-slate-800 dark:text-slate-200">{updatingLog.pcId} - {updatingLog.description}</p>
              </div>

              {/* Status update */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Update Status Perbaikan:</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Pending', 'In Progress', 'Resolved'].map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setUpdateStatus(st)}
                      className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                        updateStatus === st
                          ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/10'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes input */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Catatan Teknisi / Progress Log:</label>
                <textarea
                  rows={3}
                  placeholder="Ketik catatan teknisi saat ini..."
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50">
              <button 
                type="button"
                onClick={() => setUpdatingLog(null)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Batal
              </button>
              <button 
                type="button"
                disabled={updating}
                onClick={handleSaveUpdate}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-md shadow-brand-600/10"
              >
                {updating ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
