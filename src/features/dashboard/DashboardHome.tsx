import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDashboardStats, useRecentActivities } from './queries';
import { dashboardService } from './service';
import { useTheme } from '../../app/providers';
import { Card } from '../../shared/components/ui/Card';
import { Badge } from '../../shared/components/ui/Badge';
import { Modal } from '../../shared/components/ui/Modal';
import { Button } from '../../shared/components/ui/Button';
import { LoadingState } from '../../shared/components/ui/LoadingState';
import {
  Monitor,
  Network,
  Wrench,
  Activity,
  Layers,
  ArrowRight,
  Wifi,
  Gauge,
  Cpu,
  RefreshCw,
  Bell,
  Clock,
  Layers as LayersIcon
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { supabase } from '../../lib/supabase';

interface PCObject {
  name: string;
  status: 'Aktif' | 'Maintenance' | 'Rusak';
  os: string;
  ip: string;
  cpu: string;
  ram: string;
}

export const DashboardHome: React.FC = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useDashboardStats();
  const { data: activities, isLoading: activitiesLoading, refetch: refetchActivities } = useRecentActivities();
  
  // NOC Simulation metrics
  const [metrics, setMetrics] = useState<any[]>([]);
  
  // Computer detail modal state
  const [selectedPC, setSelectedPC] = useState<PCObject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Real Database state
  const [computers, setComputers] = useState<any[]>([]);
  const [labs, setLabs] = useState<any[]>([]);
  const [selectedLabId, setSelectedLabId] = useState('');

  // Fetch labs and computers from database
  useEffect(() => {
    async function loadData() {
      const { data: labsData } = await supabase
        .from('laboratories')
        .select('id, lab_name')
        .is('deleted_at', null)
        .order('lab_name');

      if (labsData) {
        setLabs(labsData);
        if (labsData.length > 0) {
          setSelectedLabId(labsData[0].id);
        }
      }

      const { data: compData } = await supabase
        .from('computers')
        .select('id, computer_name, condition, status, operating_system, processor, ram, storage, laboratory_id')
        .is('deleted_at', null)
        .order('computer_name');

      if (compData) {
        setComputers(compData);
      }
    }
    loadData();
  }, []);

  // Initialize simulated network metrics
  useEffect(() => {
    setMetrics(dashboardService.generateRealTimeMetrics(10));

    const interval = setInterval(() => {
      setMetrics(prev => {
        const nextTime = new Date();
        const timeStr = nextTime.toTimeString().split(' ')[0].substring(3);
        const newMetric = {
          time: timeStr,
          download: Math.floor(260 + Math.random() * 60),
          upload: Math.floor(85 + Math.random() * 25),
          latency: Math.floor(4 + Math.random() * 7),
          packetLoss: Math.random() > 0.97 ? 1 : 0,
        };
        return [...prev.slice(1), newMetric];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const activeLabComputers = computers.filter(c => c.laboratory_id === selectedLabId);

  const handlePCMapClick = (pc: PCObject) => {
    setSelectedPC(pc);
    setIsModalOpen(true);
  };

  const handleRefreshAll = () => {
    refetchStats();
    refetchActivities();
  };

  if (statsLoading || activitiesLoading) {
    return <LoadingState />;
  }

  const latestStats = stats!;
  const recentActivities = activities || [];

  return (
    <div className="space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Network Operation Center (NOC)
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pemantauan real-time sediaan lab komputer, log perbaikan, dan bandwidth link ISP.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-4 h-4" />} onClick={handleRefreshAll}>
            Refresh
          </Button>
          <div className="text-xs text-slate-400 font-semibold">
            Last Sync: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* TOP ROW SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Workstation PC summary */}
        <Card hoverEffect className="relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-slate-100 dark:text-slate-900 group-hover:text-sky-500/10 transition-colors pointer-events-none">
            <Monitor className="w-20 h-20" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Workstations (Lab PC)
          </h4>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {latestStats.computers.total}
            </span>
            <span className="text-xs font-semibold text-slate-400">PC Terdaftar</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {latestStats.computers.healthyActive} Online
            </span>
            <span className="flex items-center gap-1 text-amber-500 dark:text-amber-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              {latestStats.computers.maintenance} Maint
            </span>
            <span className="flex items-center gap-1 text-rose-500 dark:text-rose-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              {latestStats.computers.slightDamage + latestStats.computers.severeDamage} Rusak
            </span>
          </div>
        </Card>

        {/* Global Health Score */}
        <Card hoverEffect className="relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-slate-100 dark:text-slate-900 group-hover:text-sky-500/10 transition-colors pointer-events-none">
            <Activity className="w-20 h-20" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Global Health Score
          </h4>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-extrabold text-sky-500 dark:text-sky-400">
              {Math.round((latestStats.computers.healthyActive / latestStats.computers.total) * 100)}%
            </span>
            <span className="text-xs font-semibold text-slate-400">Aset Lab Sehat</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Rasio kelayakan PC workstation dan link switch ports aktif saat ini.
          </p>
        </Card>

        {/* Internet Connection Stats */}
        <Card hoverEffect className="relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-slate-100 dark:text-slate-900 group-hover:text-sky-500/10 transition-colors pointer-events-none">
            <Wifi className="w-20 h-20" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Internet Connection
          </h4>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-extrabold text-emerald-500 dark:text-emerald-400">
              Excellent
            </span>
          </div>
          <div className="text-xs space-y-1 text-slate-500 dark:text-slate-400">
            <p>ISP: Biznet Dedicated Enterprise</p>
            <p>Public IP: 103.120.40.15</p>
          </div>
        </Card>

        {/* Pending Tickets / Maintenance */}
        <Card hoverEffect className="relative overflow-hidden group">
          <div className="absolute right-3 top-3 text-slate-100 dark:text-slate-900 group-hover:text-sky-500/10 transition-colors pointer-events-none">
            <Wrench className="w-20 h-20" />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Maintenance & Tickets
          </h4>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-extrabold text-slate-800 dark:text-white">
              {latestStats.maintenance.pendingJobs + latestStats.maintenance.inProgressJobs}
            </span>
            <span className="text-xs font-semibold text-slate-400">Pekerjaan Aktif</span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500 dark:text-slate-400">
              Pending: {latestStats.maintenance.pendingJobs}
            </span>
            <span className="text-sky-500 font-semibold">
              In Progress: {latestStats.maintenance.inProgressJobs}
            </span>
          </div>
        </Card>
      </div>

      {/* DYNAMIC BANDWIDTH GRAPHS */}
      <Card className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-base text-slate-800 dark:text-white">Bandwidth & Traffic Monitoring</h3>
            </div>
            <div className="flex gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-sky-500">
                <span className="w-2 h-2 rounded bg-sky-500"></span> Download
              </span>
              <span className="flex items-center gap-1.5 text-blue-600">
                <span className="w-2 h-2 rounded bg-blue-600"></span> Upload
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics}>
                <defs>
                  <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} unit=" Mbps" />
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }} 
                  labelClassName="text-xs font-bold text-slate-500"
                />
                <Area type="monotone" dataKey="download" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorDown)" name="Download" />
                <Area type="monotone" dataKey="upload" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorUp)" name="Upload" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base text-slate-800 dark:text-white">Connection Latency</h3>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} unit=" ms" />
                <Tooltip 
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0' }}
                  labelClassName="text-xs font-bold text-slate-500"
                />
                <Line type="monotone" dataKey="latency" stroke="#6366f1" strokeWidth={2} dot={false} name="Latency" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* INTERACTIVE 45-PC DESK MAP GRID LAYOUT */}
      <Card className="space-y-6">
        <div>
          <h3 className="font-bold text-base text-slate-800 dark:text-white mb-1">Denah Komputer Interaktif (Lab Map)</h3>
          <p className="text-xs text-slate-500">Pilih laboratorium untuk melihat tata letak fisik 45 unit workstation komputer secara real-time.</p>
        </div>

        {/* Lab Selector Tabs */}
        <div className="flex flex-wrap gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
          {labs.map(l => (
            <button
              key={l.id}
              type="button"
              onClick={() => setSelectedLabId(l.id)}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all duration-200 border ${
                selectedLabId === l.id
                  ? 'bg-sky-500 border-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {l.lab_name}
            </button>
          ))}
        </div>

        {/* Dynamic Classroom Grid Map */}
        <div className="p-6 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase">
              {labs.find(l => l.id === selectedLabId)?.lab_name || 'Laboratorium'}
            </h4>
            <Badge variant="indigo">Kapasitas: {activeLabComputers.length} / 45 PC Terpasang</Badge>
          </div>

          {activeLabComputers.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              Tidak ada workstation terdaftar di laboratorium ini.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-3.5 max-w-4xl mx-auto">
              {activeLabComputers.map(pc => {
                const pcNum = pc.computer_name.split('-')[1] || '00';
                return (
                  <button
                    key={pc.id}
                    type="button"
                    onClick={() => handlePCMapClick({
                      name: pc.computer_name,
                      status: pc.condition === 'Baik' ? 'Aktif' : pc.condition === 'Maintenance' ? 'Maintenance' : 'Rusak',
                      os: pc.operating_system,
                      ip: `192.168.${selectedLabId === 'c1111111-1111-1111-1111-111111111111' ? '10' : selectedLabId === 'c2222222-2222-2222-2222-222222222222' ? '20' : selectedLabId === 'c3333333-3333-3333-3333-333333333333' ? '30' : selectedLabId === 'c4444444-4444-4444-4444-444444444444' ? '40' : selectedLabId === 'c5555555-5555-5555-5555-555555555555' ? '50' : '60'}.${10 + Number(pcNum)}`,
                      cpu: pc.processor || 'Intel Core i5 / AMD Ryzen 5',
                      ram: pc.ram || '8GB DDR4'
                    })}
                    className={`relative p-2.5 h-16 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 shadow-sm ${
                      pc.condition === 'Baik'
                        ? 'bg-emerald-50/70 hover:bg-emerald-100/70 border-emerald-200/50 dark:bg-emerald-950/20 dark:border-emerald-800/30'
                        : pc.condition === 'Maintenance'
                        ? 'bg-amber-50/70 hover:bg-amber-100/70 border-amber-200/50 dark:bg-amber-950/20 dark:border-amber-800/30'
                        : 'bg-rose-50/70 hover:bg-rose-100/70 border-rose-200/50 dark:bg-rose-950/20 dark:border-rose-800/30'
                    }`}
                  >
                    <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">PC</span>
                    <span className="text-base font-black text-slate-700 dark:text-slate-100 leading-tight">{pcNum}</span>
                    
                    {/* Status dot */}
                    <span className={`absolute top-2 right-2 w-1.5 h-1.5 rounded-full ${
                      pc.condition === 'Baik' ? 'bg-emerald-500' : pc.condition === 'Maintenance' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}></span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </Card>

      {/* LOWER PANEL: RECENT ACTIVITIES & ACTIVE ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent activities audit logs */}
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-500" />
              <h3 className="font-bold text-base text-slate-800 dark:text-white">Jejak Audit Aktivitas Terkini</h3>
            </div>
            <Link to="/reports" className="text-xs text-sky-500 hover:text-sky-600 font-semibold flex items-center gap-1">
              Selengkapnya <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-850 overflow-hidden">
            {recentActivities.map((act, index) => (
              <div key={index} className="py-3 flex items-start gap-4 text-xs">
                <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                    <span className="text-slate-800 dark:text-white font-bold">{act.user_name}</span>{' '}
                    {act.action_description}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Tabel: {act.target_table} • {new Date(act.event_time).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Global Warnings & System Alerts */}
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-slate-800 dark:text-white">Pemberitahuan Sistem (Alerts)</h3>
          </div>

          <div className="space-y-3">
            {/* Alert 1: Low stock item warning */}
            <div className="p-3 border border-amber-200/50 dark:border-amber-800/30 rounded-xl bg-amber-50/40 dark:bg-amber-950/10 flex items-start gap-3">
              <div className="flex-shrink-0 text-amber-500 mt-0.5">
                <LayersIcon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-0.5">LOW STOCK WARNING</h4>
                <p className="text-[11px] text-amber-700 dark:text-amber-400">RJ45 Connector tersisa 18 pcs di gudang. Batas aman: 20 pcs.</p>
              </div>
            </div>

            {/* Alert 2: Warranty alerts */}
            <div className="p-3 border border-rose-200/50 dark:border-rose-800/30 rounded-xl bg-rose-50/40 dark:bg-rose-950/10 flex items-start gap-3">
              <div className="flex-shrink-0 text-rose-500 mt-0.5">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-0.5">WARRANTY WARNING</h4>
                <p className="text-[11px] text-rose-700 dark:text-rose-400">Garansi monitor LG PC-12 & PC-18 akan habis dalam waktu 30 hari.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* QUICK VIEW COMPONENT MODAL (FOR PC MAP CLICK) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Spesifikasi Teknis ${selectedPC?.name}`}
        footer={
          <Button variant="primary" size="sm" onClick={() => {
            setIsModalOpen(false);
            navigate('/computers');
          }}>
            Buka Inventaris Komputer
          </Button>
        }
      >
        {selectedPC && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <Badge variant={selectedPC.status === 'Aktif' ? 'success' : selectedPC.status === 'Maintenance' ? 'warning' : 'danger'}>
                {selectedPC.status}
              </Badge>
              <span className="text-xs font-semibold text-slate-400">IP: {selectedPC.ip}</span>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="font-bold text-slate-500">Sistem Operasi</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPC.os}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-50/50 dark:border-slate-850">
                <span className="font-bold text-slate-500 flex items-center gap-1"><Cpu className="w-3.5 h-3.5" /> Processor</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPC.cpu}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-slate-50/50 dark:border-slate-850">
                <span className="font-bold text-slate-500">RAM Memory</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedPC.ram}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default DashboardHome;
