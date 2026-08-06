import React from 'react';
import { 
  LayoutDashboard, 
  Monitor, 
  Network, 
  FileCode2, 
  Wrench, 
  CalendarClock, 
  Activity, 
  X,
  Server
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen, setSidebarOpen }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pc_inventory', label: 'Inventaris PC', icon: Monitor },
    { id: 'network_devices', label: 'Perangkat Jaringan', icon: Network },
    { id: 'software_licenses', label: 'Lisensi Software', icon: FileCode2 },
    { id: 'maintenance_schedule', label: 'Jadwal Maintenance', icon: Wrench },
    { id: 'loan_system', label: 'Peminjaman Barang', icon: CalendarClock },
    { id: 'internet_monitoring', label: 'Monitoring Internet', icon: Activity },
  ];

  return (
    <>
      {/* Overlay behind sidebar on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-slate-900 text-slate-100 flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 lg:static lg:h-full
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-brand-500 text-white shadow-md shadow-brand-500/20">
              <Server size={20} />
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-wide bg-gradient-to-r from-white via-slate-100 to-brand-300 bg-clip-text text-transparent">LabNet Manager</h1>
              <p className="text-[10px] text-slate-500 font-medium">Sistem Terintegrasi</p>
            </div>
          </div>
          {/* Close button on mobile */}
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-md hover:bg-slate-800 text-slate-400"
            aria-label="Tutup Sidebar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false); // Auto close on mobile click
                }}
                className={`
                  w-full flex items-center gap-3 px-3.5 py-3 text-xs font-semibold rounded-xl transition-all duration-150 group
                  ${isActive 
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-600/10' 
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }
                `}
              >
                <Icon 
                  size={16} 
                  className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} 
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer / Copyright */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/20">
          <div className="text-[10px] text-slate-500 font-medium text-center">
            <p>&copy; 2026 LabNet V1.0</p>
            <p className="mt-0.5 text-slate-600">Dikembangkan untuk Lab Kampus</p>
          </div>
        </div>
      </aside>
    </>
  );
}
