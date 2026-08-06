import React, { useState, useEffect } from 'react';
import { db } from '../supabaseClient';
import { 
  CalendarClock, 
  Plus, 
  ArrowLeftRight, 
  CheckCircle2, 
  User, 
  ShoppingBag,
  Info,
  Calendar,
  X
} from 'lucide-react';

export default function LoanSystem() {
  const [loans, setLoans] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Loan Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [borrowerName, setBorrowerName] = useState('');
  const [borrowerId, setBorrowerId] = useState('');
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const loanData = await db.getLoans();
      const itemData = await db.getLoanableItems();
      setLoans(loanData);
      setItems(itemData);
      if (itemData.length > 0) {
        setSelectedItem(itemData[0].name);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddLoan = async (e) => {
    e.preventDefault();
    if (borrowerName.trim() === '' || borrowerId.trim() === '' || !selectedItem) return;
    
    // Validasi stok
    const targetItem = items.find(item => item.name === selectedItem);
    if (!targetItem || targetItem.available < quantity) {
      alert('Stok barang tidak mencukupi untuk jumlah peminjaman ini.');
      return;
    }

    setSubmitting(true);
    try {
      const newLoan = {
        borrowerName,
        borrowerId,
        itemName: selectedItem,
        quantity: parseInt(quantity, 10),
        borrowDate: new Date().toISOString().split('T')[0],
        // Due date defaults to +3 days
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Dipinjam',
        purpose
      };

      await db.addLoan(newLoan);
      
      // Reset form
      setBorrowerName('');
      setBorrowerId('');
      setQuantity(1);
      setPurpose('');
      setShowAddForm(false);

      // Reload
      await loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnItem = async (loanId) => {
    if (!window.confirm('Konfirmasi pengembalian barang?')) return;
    try {
      await db.returnLoan(loanId);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Peminjaman Inventaris Lab</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Pencatatan sirkulasi peminjaman perangkat pendukung praktikum (proyektor, development kit, adapter, dll.).</p>
        </div>

        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/15"
        >
          <Plus size={15} />
          <span>Isi Peminjaman Baru</span>
        </button>
      </div>

      {/* Grid: Left - Stock Available list, Right - Loan Log */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (1/3) - Stock Inventory */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <ShoppingBag size={14} className="text-brand-500" />
              Stok Inventaris Lab
            </h3>
            
            <div className="space-y-3.5">
              {items.map((item, idx) => {
                const availablePct = Math.min(100, Math.round((item.available / item.total) * 100));
                
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold">{item.name}</span>
                      <span className="text-slate-400 font-bold">{item.available} / {item.total} tersedia</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          availablePct < 25 ? 'bg-rose-500' : (availablePct < 55 ? 'bg-amber-500' : 'bg-brand-500')
                        }`}
                        style={{ width: `${availablePct}%` }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800/40 text-[10px] text-slate-500 flex gap-2">
              <Info size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">Peminjaman hanya diperbolehkan untuk dosen atau mahasiswa aktif dengan persetujuan asisten lab penanggung jawab.</p>
            </div>
          </div>

          {/* Right Column (2/3) - Loan logs */}
          <div className="lg:col-span-2 glass-panel rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">Sirkulasi & Riwayat Peminjaman</h3>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full">
                Total {loans.length} transaksi
              </span>
            </div>

            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 uppercase font-bold">
                      <th className="pb-2">Peminjam</th>
                      <th className="pb-2">Nama Barang</th>
                      <th className="pb-2">Jadwal Pinjam</th>
                      <th className="pb-2 text-right">Aksi Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                    {loans.map(loan => {
                      const isBorrowed = loan.status === 'Dipinjam';
                      
                      return (
                        <tr key={loan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                          <td className="py-3.5 pr-2">
                            <p className="font-bold text-slate-800 dark:text-slate-200">{loan.borrowerName}</p>
                            <p className="text-[10px] text-slate-400">ID: {loan.borrowerId}</p>
                          </td>
                          <td className="py-3.5">
                            <p className="font-semibold text-slate-700 dark:text-slate-300">{loan.itemName}</p>
                            <p className="text-[10px] text-slate-400">Jumlah: {loan.quantity} unit</p>
                            {loan.purpose && <p className="text-[10px] italic text-slate-400 mt-0.5">"{loan.purpose}"</p>}
                          </td>
                          <td className="py-3.5 text-slate-500">
                            <p className="flex items-center gap-1"><span className="text-slate-400">Pinjam:</span> {loan.borrowDate}</p>
                            {isBorrowed ? (
                              <p className="flex items-center gap-1 font-medium text-amber-500"><span className="text-slate-400">Deadline:</span> {loan.dueDate}</p>
                            ) : (
                              <p className="flex items-center gap-1 text-emerald-500"><span className="text-slate-400">Kembali:</span> {loan.returnDate}</p>
                            )}
                          </td>
                          <td className="py-3.5 text-right">
                            {isBorrowed ? (
                              <button
                                onClick={() => handleReturnItem(loan.id)}
                                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-bold border border-amber-200/50 dark:border-amber-900/30 transition-colors"
                              >
                                Kembalikan Barang
                              </button>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
                                <CheckCircle2 size={10} />
                                Selesai
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Add Loan Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-md animate-fade-in">
          <form 
            onSubmit={handleAddLoan}
            className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700/80 animate-scale-in"
          >
            {/* Header */}
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <CalendarClock size={16} className="text-brand-500" />
                Catat Transaksi Peminjaman
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
              
              {/* Borrower Name */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Nama Lengkap Peminjam:</label>
                <input
                  type="text"
                  required
                  placeholder="Ketik nama dosen atau mahasiswa..."
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* NIM / NIP */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Nomor Induk Mahasiswa / Pegawai (NIM/NIP):</label>
                <input
                  type="text"
                  required
                  placeholder="Ketik NIM / NIP peminjam..."
                  value={borrowerId}
                  onChange={(e) => setBorrowerId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Dropdown Items & Quantity */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <label className="font-semibold text-slate-400">Pilih Barang:</label>
                  <select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100 font-semibold"
                  >
                    {items.map((item, idx) => (
                      <option key={idx} value={item.name} disabled={item.available <= 0}>
                        {item.name} (Sisa: {item.available})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-slate-400">Jumlah (Unit):</label>
                  <input
                    type="number"
                    min={1}
                    max={items.find(i => i.name === selectedItem)?.available || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-800 dark:text-slate-100 text-center font-bold"
                  />
                </div>
              </div>

              {/* Purpose */}
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-400">Tujuan Peminjaman:</label>
                <input
                  type="text"
                  placeholder="Contoh: Praktikum Pemrograman Jaringan di Ruang Kelas 302..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
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
                {submitting ? 'Menyimpan...' : 'Pinjamkan'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
