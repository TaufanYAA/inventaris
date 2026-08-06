import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Monitor, Network, Wrench, Layers, Terminal, Sparkles, X } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearch('');
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Global toggle shortcut (Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Static list of commands with role restrictions
  const commands = [
    {
      title: 'Navigasi Dashboard',
      subtitle: 'Buka monitor utama ruangan server & lab.',
      action: () => navigate('/'),
      icon: Sparkles,
      roles: ['Admin', 'Laboran', 'Teknisi', 'Operator', 'Mahasiswa'],
    },
    {
      title: 'Cari PC Workstation',
      subtitle: 'Buka daftar 45 komputer & spesifikasinya.',
      action: () => navigate('/computers'),
      icon: Monitor,
      roles: ['Admin', 'Laboran', 'Teknisi', 'Operator', 'Mahasiswa'],
    },
    {
      title: 'Cari Switch Port / AP',
      subtitle: 'Buka pemetaan port switch core & IPAM.',
      action: () => navigate('/network'),
      icon: Network,
      roles: ['Admin', 'Laboran', 'Teknisi'],
    },
    {
      title: 'Cari Tiket Pemeliharaan',
      subtitle: 'Buka daftar aduan user & penugasan teknisi.',
      action: () => navigate('/maintenance'),
      icon: Wrench,
      roles: ['Admin', 'Teknisi'],
    },
    {
      title: 'Cari RJ45 / Kabel LAN',
      subtitle: 'Buka gudang bahan habis pakai & peminjaman.',
      action: () => navigate('/consumables'),
      icon: Layers,
      roles: ['Admin', 'Laboran'],
    },
  ];

  const filteredCommands = commands.filter(cmd => {
    const hasRole = user && cmd.roles.includes(user.role);
    const matchesSearch =
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.subtitle.toLowerCase().includes(search.toLowerCase());
    return hasRole && matchesSearch;
  });

  const handleCommandClick = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose}></div>

      {/* Palette Body */}
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl shadow-2xl z-10 overflow-hidden flex flex-col transform transition-all duration-200 scale-100">
        {/* Search Input field */}
        <div className="relative flex items-center border-b border-slate-200/50 dark:border-slate-800/50 px-4">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ketik nama PC, IP address, atau menu komando (Ctrl+K)..."
            className="w-full py-4 text-slate-800 dark:text-slate-100 placeholder-slate-400 bg-transparent outline-none text-sm font-medium"
          />
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Lists */}
        <div className="flex-1 overflow-y-auto max-h-[350px] p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Terminal className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
              <p className="text-xs">Komando "{search}" tidak ditemukan.</p>
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleCommandClick(cmd.action)}
                  className="w-full flex items-start gap-4 p-3.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950/40 text-left transition-colors group"
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight mb-0.5">
                      {cmd.title}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {cmd.subtitle}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
export default CommandPalette;
