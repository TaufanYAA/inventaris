import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useTheme } from '../app/providers';
import { CommandPalette } from '../shared/components/CommandPalette';
import { Badge } from '../shared/components/ui/Badge';
import {
  LayoutDashboard,
  Monitor,
  Network,
  Layers,
  FileCode2,
  Wrench,
  FileText,
  AlertOctagon,
  GitBranch,
  Network as NetIcon,
  HelpCircle,
  Hash,
  Search,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  User,
  Bell,
  Menu,
  FileSpreadsheet,
  Settings as SettingsIcon,
  Cable
} from 'lucide-react';

interface SidebarGroup {
  groupName?: string;
  items: Array<{
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    roles: string[];
  }>;
}

export const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Structured sidebar groups according to PM blueprints
  const sidebarGroups: SidebarGroup[] = [
    {
      items: [
        {
          label: 'Dashboard',
          path: '/',
          icon: LayoutDashboard,
          roles: ['Admin', 'Laboran', 'Teknisi', 'Operator', 'Mahasiswa'],
        },
      ],
    },
    {
      groupName: 'Asset Management',
      items: [
        {
          label: 'Computers',
          path: '/computers',
          icon: Monitor,
          roles: ['Admin', 'Laboran', 'Teknisi', 'Operator', 'Mahasiswa'],
        },
        {
          label: 'Network Devices',
          path: '/network/devices',
          icon: Network,
          roles: ['Admin', 'Laboran', 'Teknisi'],
        },
        {
          label: 'Consumables',
          path: '/consumables',
          icon: Layers,
          roles: ['Admin', 'Laboran'],
        },
        {
          label: 'Software',
          path: '/software',
          icon: FileCode2,
          roles: ['Admin', 'Laboran', 'Teknisi'],
        },
      ],
    },
    {
      groupName: 'Operations',
      items: [
        {
          label: 'Maintenance',
          path: '/maintenance/jobs',
          icon: Wrench,
          roles: ['Admin', 'Teknisi'],
        },
        {
          label: 'Tickets',
          path: '/maintenance/tickets',
          icon: FileText,
          roles: ['Admin', 'Laboran', 'Teknisi', 'Operator', 'Mahasiswa'],
        },
        {
          label: 'Incidents',
          path: '/maintenance/incidents',
          icon: AlertOctagon,
          roles: ['Admin', 'Teknisi'],
        },
      ],
    },
    {
      groupName: 'Network',
      items: [
        {
          label: 'Topology',
          path: '/network/topology',
          icon: GitBranch,
          roles: ['Admin', 'Laboran', 'Teknisi'],
        },
        {
          label: 'IPAM',
          path: '/network/ipam',
          icon: NetIcon,
          roles: ['Admin', 'Laboran', 'Teknisi'],
        },
        {
          label: 'VLAN',
          path: '/network/vlan',
          icon: Hash,
          roles: ['Admin', 'Laboran', 'Teknisi'],
        },
        {
          label: 'DHCP Scopes',
          path: '/network/dhcp',
          icon: HelpCircle,
          roles: ['Admin', 'Laboran', 'Teknisi'],
        },
        {
          label: 'DNS Records',
          path: '/network/dns',
          icon: HelpCircle,
          roles: ['Admin', 'Laboran', 'Teknisi'],
        },
        {
          label: 'Switch Ports',
          path: '/network/ports',
          icon: Cable,
          roles: ['Admin', 'Laboran', 'Teknisi'],
        },
      ],
    },
    {
      items: [
        {
          label: 'Reports',
          path: '/reports',
          icon: FileSpreadsheet,
          roles: ['Admin', 'Laboran', 'Teknisi'],
        },
        {
          label: 'Settings',
          path: '/settings',
          icon: SettingsIcon,
          roles: ['Admin'],
        },
      ],
    },
  ];

  const checkRoleAccess = (itemRoles: string[]) => {
    return user && itemRoles.includes(user.role);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* GLOBAL SEARCH SHORTCUT MODAL (Ctrl + K) */}
      <CommandPalette isOpen={paletteOpen} onClose={() => setPaletteOpen(false)} />

      {/* SIDEBAR - DESKTOP */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-200/60 dark:border-slate-800/60 glass-panel shadow-sm transition-all duration-300 relative ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200/50 dark:border-slate-800/50">
          <Link to="/" className="flex items-center gap-3 font-bold text-lg text-slate-800 dark:text-white">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 shadow-md shadow-sky-400/20 text-white">
              <NetIcon className="w-5 h-5" />
            </div>
            {!collapsed && (
              <span className="bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-100 dark:to-white bg-clip-text text-transparent">
                LabNet
              </span>
            )}
          </Link>
        </div>

        {/* Sidebar Groups Nav */}
        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {sidebarGroups.map((group, groupIdx) => {
            // Filter allowed items for this group
            const allowedItems = group.items.filter(item => checkRoleAccess(item.roles));
            if (allowedItems.length === 0) return null;

            return (
              <div key={groupIdx} className="space-y-1">
                {group.groupName && !collapsed && (
                  <h4 className="px-3 mb-1.5 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                    {group.groupName}
                  </h4>
                )}
                {allowedItems.map(item => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-semibold transition-all duration-200 text-xs ${
                        isActive
                          ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/10'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 flex-shrink-0 ${isActive ? 'text-white' : ''}`} />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Collapse Button */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute bottom-20 -right-3 w-6 h-6 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* User profile footer */}
        {user && (
          <div className="p-3 border-t border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-950/20">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <User className="w-4 h-4" />
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                    {user.fullName}
                  </p>
                  <div className="flex mt-0.5">
                    <Badge variant="info" className="text-[9px] px-1.5 py-0">
                      {user.role}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* MOBILE SIDEBAR DRAW */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)}></div>
          <aside className="relative flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <span className="font-bold text-lg text-sky-600 dark:text-sky-400">LabNet</span>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400">
                <ChevronLeft className="w-6 h-6" />
              </button>
            </div>
            
            <nav className="space-y-4">
              {sidebarGroups.map((group, groupIdx) => {
                const allowedItems = group.items.filter(item => checkRoleAccess(item.roles));
                if (allowedItems.length === 0) return null;

                return (
                  <div key={groupIdx} className="space-y-1">
                    {group.groupName && (
                      <h4 className="px-3 mb-1 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                        {group.groupName}
                      </h4>
                    )}
                    {allowedItems.map(item => {
                      const isActive = location.pathname === item.path;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setMobileOpen(false)}
                          className={`flex items-center gap-3 px-3 py-2 rounded-xl font-semibold transition-all duration-200 text-xs ${
                            isActive ? 'bg-sky-500 text-white' : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          <Icon className="w-4.5 h-4.5" />
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* CORE WORKSPACE CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TOPBAR HEADER */}
        <header className="h-16 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Command Palette trigger box */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 w-60 rounded-xl bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200/40 dark:border-slate-800/40 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all text-xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="flex-1 text-left font-medium">Pencarian Cepat...</span>
              <kbd className="px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 font-mono text-[9px]">Ctrl+K</kbd>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Topbar Command Palette trigger icon for mobile */}
            <button
              onClick={() => setPaletteOpen(true)}
              className="sm:hidden p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Server Connection status */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              NOC Active
            </div>

            <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Bell className="w-5 h-5" />
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <span className="h-6 w-px bg-slate-200 dark:bg-slate-800"></span>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Keluar</span>
            </button>
          </div>
        </header>

        {/* CONTAINER FOR ROUTED VIEWS */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-900/10">
          <div className="max-w-7xl mx-auto p-4 md:p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
