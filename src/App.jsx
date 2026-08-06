import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import PcInventory from './components/PcInventory';
import NetworkDevices from './components/NetworkDevices';
import SoftwareLicenses from './components/SoftwareLicenses';
import MaintenanceSchedule from './components/MaintenanceSchedule';
import LoanSystem from './components/LoanSystem';
import InternetMonitoring from './components/InternetMonitoring';
import { db } from './supabaseClient';
import { Sun, Moon, Bell, Shield, Network, RefreshCw } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'PC-15 dalam status Perbaikan', type: 'info', read: false },
    { id: 2, text: 'Lisensi Adobe CC berakhir dalam 1 bulan', type: 'warning', read: false },
    { id: 3, text: 'Downtime AP Koridor terdeteksi (15 menit lalu)', type: 'error', read: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [syncStatus, setSyncStatus] = useState('Terhubung');

  // Load dark mode preference
  useEffect(() => {
    const savedDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDark);
    if (savedDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('darkMode', String(nextDark));
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleSync = () => {
    setSyncStatus('Sinkronisasi...');
    setTimeout(() => {
      setSyncStatus('Terhubung');
    }, 1000);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
  };

  // Render active tab content
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'pc_inventory':
        return <PcInventory />;
      case 'network_devices':
        return <NetworkDevices />;
      case 'software_licenses':
        return <SoftwareLicenses />;
      case 'maintenance_schedule':
        return <MaintenanceSchedule />;
      case 'loan_system':
        return <LoanSystem />;
      case 'internet_monitoring':
        return <InternetMonitoring />;
      default:
        return <Dashboard setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200 overflow-hidden font-sans">
      {/* Sidebar for Desktop & Mobile */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        sidebarOpen={sidebarOpen} 
        setSidebarOpen={setSidebarOpen} 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700/80 z-20 transition-colors duration-200">
          
          {/* Left: Mobile hamburger & title */}
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
              aria-label="Buka Sidebar"
            >
              <Network size={20} />
            </button>
            
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30">
                Lab Jaringan Utama
              </span>
              <button 
                onClick={handleSync}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600/80 transition-colors"
              >
                <RefreshCw size={11} className={syncStatus === 'Sinkronisasi...' ? 'animate-spin' : ''} />
                <span>{syncStatus}</span>
              </button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            
            {/* Dark Mode Button */}
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={darkMode ? "Aktifkan Mode Terang" : "Aktifkan Mode Gelap"}
            >
              {darkMode ? <Sun size={20} className="text-amber-500" /> : <Moon size={20} />}
            </button>

            {/* Notification Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 relative transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                )}
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border border-white dark:border-slate-800" />
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden z-50 animate-slide-in">
                  <div className="p-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Notifikasi Terkini</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={markAllRead} 
                        className="text-[10px] text-brand-500 hover:underline font-semibold"
                      >
                        Tandai semua dibaca
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/50">
                    {notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`p-3 text-xs flex gap-2.5 transition-colors ${n.read ? 'opacity-70 bg-transparent' : 'bg-brand-50/20 dark:bg-brand-950/10'}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                          n.type === 'error' ? 'bg-rose-500' : (n.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500')
                        }`} />
                        <p className="text-slate-600 dark:text-slate-300 leading-normal">{n.text}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-2 text-center border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <span className="text-[10px] text-slate-400">Menampilkan 3 notifikasi sistem terbaru</span>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Info */}
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
              <div className="hidden md:block text-right">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">Admin Teknisi</p>
                <p className="text-[10px] text-slate-400">Level: Superadmin</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-500 to-sky-400 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-brand-500/20">
                AD
              </div>
            </div>

          </div>
        </header>

        {/* View Workspace Container */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
