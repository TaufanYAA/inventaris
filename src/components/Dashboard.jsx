import React, { useState, useEffect } from 'react';
import { db } from '../supabaseClient';
import { 
  Monitor, 
  Network, 
  Wrench, 
  CalendarClock, 
  Activity, 
  ArrowRight,
  TrendingUp,
  Cpu,
  Wifi
} from 'lucide-react';

export default function Dashboard({ setActiveTab }) {
  const [stats, setStats] = useState({
    pcs: { total: 45, online: 41, offline: 2, maintenance: 2 },
    network: { total: 7, online: 6, issues: 1, offline: 0 },
    loans: 0,
    maintenance: 0,
    latestLoans: [],
    latestMaintenance: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const pcs = await db.getPCs();
        const network = await db.getNetworkDevices();
        const loans = await db.getLoans();
        const maintenance = await db.getMaintenanceLogs();

        // Calculate PC statistics
        const totalPcs = pcs.length;
        const onlinePcs = pcs.filter(pc => pc.status === 'Online').length;
        const offlinePcs = pcs.filter(pc => pc.status === 'Offline').length;
        const maintenancePcs = pcs.filter(pc => pc.status === 'Maintenance').length;

        // Calculate Network stats
        const totalNet = network.length;
        const onlineNet = network.filter(n => n.status === 'Online').length;
        const issuesNet = network.filter(n => n.status === 'Issues').length;
        const offlineNet = network.filter(n => n.status === 'Offline').length;

        // Active loans (status = 'Dipinjam')
        const activeLoans = loans.filter(l => l.status === 'Dipinjam');
        // Pending maintenance (status = 'Pending' or 'In Progress')
        const activeMaintenance = maintenance.filter(m => m.status !== 'Resolved');

        setStats({
          pcs: { total: totalPcs, online: onlinePcs, offline: offlinePcs, maintenance: maintenancePcs },
          network: { total: totalNet, online: onlineNet, issues: issuesNet, offline: offlineNet },
          loans: activeLoans.length,
          maintenance: activeMaintenance.length,
          latestLoans: loans.slice(0, 3), // Get 3 latest loans
          latestMaintenance: maintenance.slice(0, 3) // Get 3 latest tickets
        });
      } catch (err) {
        console.error('Gagal memuat data dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  // Stat Card Config
  const cards = [
    {
      title: 'Inventaris PC Lab',
      value: `${stats.pcs.online}/${stats.pcs.total}`,
      subtitle: `${stats.pcs.offline} offline • ${stats.pcs.maintenance} perbaikan`,
      icon: Monitor,
      color: 'bg-indigo-500',
      tab: 'pc_inventory',
      detail: `${stats.pcs.online} PC aktif online`
    },
    {
      title: 'Perangkat Jaringan',
      value: `${stats.network.online}/${stats.network.total}`,
      subtitle: `${stats.network.issues} terkendala`,
      icon: Network,
      color: 'bg-emerald-500',
      tab: 'network_devices',
      detail: 'Uptime 99.8% bulan ini'
    },
    {
      title: 'Peminjaman Aktif',
      value: stats.loans,
      subtitle: 'Barang sedang dipinjam',
      icon: CalendarClock,
      color: 'bg-amber-500',
      tab: 'loan_system',
      detail: 'Butuh verifikasi pengembalian'
    },
    {
      title: 'Tiket Perbaikan',
      value: stats.maintenance,
      subtitle: 'Belum terselesaikan',
      icon: Wrench,
      color: 'bg-rose-500',
      tab: 'maintenance_schedule',
      detail: 'Prioritas pemeliharaan mingguan'
    }
  ];

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Header and Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 text-white p-6 shadow-xl border border-slate-800">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pr-10">
          <Cpu size={250} />
        </div>
        <div className="relative z-10 max-w-xl space-y-2">
          <span className="px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
            Pusat Kendali Utama
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">Selamat Datang di LabNet Manager</h2>
          <p className="text-slate-300 text-xs leading-relaxed">
            Pantau performa 45 workstation PC, ketersediaan hardware lab, peminjaman inventaris, serta status internet kampus dalam satu platform terpusat.
          </p>
        </div>
      </div>

      {/* Grid Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i}
              onClick={() => setActiveTab(card.tab)}
              className="glass-panel glass-panel-hover rounded-2xl p-5 cursor-pointer flex flex-col justify-between"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
                  <h3 className="text-2xl font-extrabold text-slate-800 dark:text-slate-100">{card.value}</h3>
                </div>
                <div className={`p-2.5 rounded-xl ${card.color} text-white shadow-md`}>
                  <Icon size={18} />
                </div>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-medium">{card.subtitle}</span>
                </div>
                <span className="text-[10px] text-brand-500 font-bold flex items-center gap-0.5 hover:underline">
                  Kelola <ArrowRight size={10} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Internet Monitoring Mini & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle Column (2/3 width) - Lists */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active Loans */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2">
                <CalendarClock size={16} className="text-amber-500" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Log Peminjaman Terkini</h4>
              </div>
              <button 
                onClick={() => setActiveTab('loan_system')}
                className="text-[10px] font-bold text-brand-500 hover:underline flex items-center gap-0.5"
              >
                Lihat Semua <ArrowRight size={10} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 uppercase font-bold">
                      <th className="pb-2">Peminjam</th>
                      <th className="pb-2">Barang</th>
                      <th className="pb-2">Tanggal Pinjam</th>
                      <th className="pb-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-xs">
                    {stats.latestLoans.map(loan => (
                      <tr key={loan.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 pr-2">
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{loan.borrowerName}</p>
                          <p className="text-[10px] text-slate-400">{loan.borrowerId}</p>
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300">
                          {loan.itemName} <span className="text-[10px] text-slate-400">({loan.quantity}x)</span>
                        </td>
                        <td className="py-3 text-slate-500">{loan.borrowDate}</td>
                        <td className="py-3 text-right">
                          <span className={`inline-block px-2 py-0.5 text-[10px] font-bold rounded-full ${
                            loan.status === 'Dipinjam' 
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30' 
                              : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30'
                          }`}>
                            {loan.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Pending Maintenance */}
          <div className="glass-panel rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/30">
              <div className="flex items-center gap-2">
                <Wrench size={16} className="text-rose-500" />
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Log Pemeliharaan Terkini</h4>
              </div>
              <button 
                onClick={() => setActiveTab('maintenance_schedule')}
                className="text-[10px] font-bold text-brand-500 hover:underline flex items-center gap-0.5"
              >
                Lihat Semua <ArrowRight size={10} />
              </button>
            </div>
            
            <div className="p-4">
              <div className="space-y-3">
                {stats.latestMaintenance.map(log => (
                  <div key={log.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">{log.pcId}</span>
                        <span className="text-[10px] text-slate-400">| Pelapor: {log.reporter}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-300 mt-1 leading-normal">{log.description}</p>
                    </div>
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-[10px] text-slate-400">{log.reportDate}</span>
                      <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                        log.status === 'Pending' 
                          ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30'
                          : (log.status === 'In Progress' 
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50 dark:border-blue-900/30'
                            : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30')
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (1/3 width) - Network status & simulation summary */}
        <div className="space-y-6">
          
          {/* Internet Status Overview */}
          <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between h-full min-h-[300px]">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity size={16} className="text-brand-500 animate-pulse-slow" />
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Koneksi Internet Utama</h4>
                </div>
                <span className="px-2 py-0.5 text-[9px] font-extrabold rounded-full bg-emerald-500 text-white animate-pulse">
                  LIVE
                </span>
              </div>

              {/* Huge status */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-2xl p-4 text-center space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase">Latency Rata-Rata</span>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-black text-emerald-500 tracking-tight">14</span>
                  <span className="text-xs font-semibold text-emerald-600">ms</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full inline-block">
                  Sangat Stabil
                </span>
              </div>

              {/* Speeds */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Download</span>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">175.4 <span className="text-[10px] text-slate-400 font-medium">Mbps</span></p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/50 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Upload</span>
                  <p className="text-lg font-extrabold text-slate-800 dark:text-slate-100">78.2 <span className="text-[10px] text-slate-400 font-medium">Mbps</span></p>
                </div>
              </div>

              {/* Network Load Indicator */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400 uppercase">Beban Router Utama</span>
                  <span className="text-slate-700 dark:text-slate-300">42%</span>
                </div>
                <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full" style={{ width: '42%' }} />
                </div>
              </div>
            </div>

            <button 
              onClick={() => setActiveTab('internet_monitoring')}
              className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-950/20 dark:text-brand-400 dark:hover:bg-brand-950/40 border border-brand-200/30 dark:border-brand-900/20 text-xs font-bold transition-colors"
            >
              <span>Uji Kecepatan / Monitor Lengkap</span>
              <ArrowRight size={12} />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
