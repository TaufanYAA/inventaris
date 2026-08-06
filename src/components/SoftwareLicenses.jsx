import React, { useState, useEffect } from 'react';
import { db } from '../supabaseClient';
import { 
  FileCode2, 
  Key, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  EyeOff,
  Edit2,
  X
} from 'lucide-react';

export default function SoftwareLicenses() {
  const [licenses, setLicenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealKeyId, setRevealKeyId] = useState(null);
  
  // Edit state
  const [editingLicense, setEditingLicense] = useState(null);
  const [editPurchased, setEditPurchased] = useState(0);
  const [editExpires, setEditExpires] = useState('');
  const [saving, setSaving] = useState(false);

  const loadLicenses = async () => {
    setLoading(true);
    try {
      const data = await db.getSoftwareLicenses();
      setLicenses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLicenses();
  }, []);

  const toggleRevealKey = (id) => {
    setRevealKeyId(revealKeyId === id ? null : id);
  };

  const handleOpenEdit = (license) => {
    setEditingLicense(license);
    setEditPurchased(license.purchased);
    setEditExpires(license.expires);
  };

  const handleSaveEdit = async () => {
    if (!editingLicense) return;
    setSaving(true);
    try {
      const updatedFields = {
        purchased: parseInt(editPurchased, 10),
        expires: editExpires
      };

      // Set status based on expiration or usage
      if (editingLicense.used >= parseInt(editPurchased, 10)) {
        updatedFields.status = 'Warning';
      } else {
        updatedFields.status = 'Active';
      }

      await db.updateSoftwareLicense(editingLicense.id, updatedFields);
      await loadLicenses();
      setEditingLicense(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Header Panel */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Manajemen Lisensi Software</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Kelola kuota instalasi sistem operasi, perangkat produktivitas, software simulasi, dan IDE pemrograman.</p>
      </div>

      {/* List / Grid Lisensi */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {licenses.map(lic => {
            const usagePercent = Math.min(100, Math.round((lic.used / lic.purchased) * 100));
            const isRevealed = revealKeyId === lic.id;
            const isWarning = lic.status === 'Warning' || usagePercent >= 95;

            return (
              <div 
                key={lic.id} 
                className="glass-panel rounded-2xl p-5 flex flex-col justify-between border border-slate-200/50 dark:border-slate-700/50"
              >
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                      {lic.category}
                    </span>
                    <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mt-1">{lic.name}</h3>
                    <p className="text-[10px] text-slate-400">Tipe Lisensi: {lic.type}</p>
                  </div>

                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full flex items-center gap-1 ${
                    isWarning 
                      ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200/50 dark:border-rose-900/30' 
                      : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30'
                  }`}>
                    {isWarning ? <AlertTriangle size={11} /> : <CheckCircle2 size={11} />}
                    {isWarning ? 'Mendekati Kuota Maksimal' : 'Aktif / Stabil'}
                  </span>
                </div>

                {/* License Key Display */}
                <div className="my-5 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Key size={14} className="text-slate-400 flex-shrink-0" />
                    <span className="font-mono text-xs text-slate-700 dark:text-slate-300 truncate">
                      {isRevealed ? lic.key : lic.key.replace(/[A-Z0-9]/g, '*').slice(0, 15) + '... (klik tombol mata)'}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleRevealKey(lic.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 flex-shrink-0 transition-colors"
                    title={isRevealed ? "Sembunyikan Key" : "Tampilkan Key"}
                  >
                    {isRevealed ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>

                {/* Quota Progress Bar */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-slate-400">Penggunaan Kuota</span>
                    <span className="text-slate-700 dark:text-slate-300 font-bold">{lic.used} / {lic.purchased} PC ({usagePercent}%)</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isWarning ? 'bg-rose-500' : 'bg-brand-500'
                      }`}
                      style={{ width: `${usagePercent}%` }} 
                    />
                  </div>
                </div>

                {/* Footer Expiration & Action */}
                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar size={13} />
                    <span>Kadaluarsa: <strong className="text-slate-700 dark:text-slate-300">{lic.expires}</strong></span>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(lic)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-650/80 text-slate-700 dark:text-slate-300 font-bold transition-colors"
                  >
                    <Edit2 size={11} />
                    <span>Edit Kuota</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Edit License Modal */}
      {editingLicense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700/80 animate-scale-in">
            
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-100">Edit Konfigurasi Lisensi</h3>
              <button 
                onClick={() => setEditingLicense(null)}
                className="p-1.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs">
              <p className="font-bold text-slate-800 dark:text-slate-200">{editingLicense.name}</p>

              {/* Input Purchased */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Kuota Pembelian Lisensi (Unit):</label>
                <input
                  type="number"
                  min={editingLicense.used}
                  value={editPurchased}
                  onChange={(e) => setEditPurchased(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                />
                <p className="text-[10px] text-slate-400">Minimal kuota harus sama dengan lisensi terpakai saat ini ({editingLicense.used} unit).</p>
              </div>

              {/* Input Expiry */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Tanggal Kadaluarsa / Langganan:</label>
                <input
                  type="text"
                  placeholder="Contoh: Perpetual, atau format YYYY-MM-DD"
                  value={editExpires}
                  onChange={(e) => setEditExpires(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50">
              <button 
                type="button"
                onClick={() => setEditingLicense(null)}
                className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold"
              >
                Batal
              </button>
              <button 
                type="button"
                disabled={saving}
                onClick={handleSaveEdit}
                className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-md shadow-brand-600/10"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
