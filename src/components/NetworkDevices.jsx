import React, { useState, useEffect } from 'react';
import { db } from '../supabaseClient';
import { 
  Network, 
  Server, 
  Wifi, 
  Activity, 
  RotateCw, 
  Terminal as TerminalIcon, 
  Power,
  RefreshCw,
  X
} from 'lucide-react';

export default function NetworkDevices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [terminalDevice, setTerminalDevice] = useState(null);
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [pinging, setPinging] = useState(false);
  const [rebootingId, setRebootingId] = useState(null);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await db.getNetworkDevices();
      setDevices(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
  }, []);

  const handleReboot = async (id, name) => {
    setRebootingId(id);
    // 1. Set status to Offline
    await db.updateNetworkDevice(id, { status: 'Offline', uptime: '0s', load: 0 });
    await loadDevices();

    // 2. Set back to Online after 3 seconds
    setTimeout(async () => {
      await db.updateNetworkDevice(id, { 
        status: 'Online', 
        uptime: '0d 0h 0m 10s', 
        load: Math.floor(Math.random() * 30) + 15 
      });
      await loadDevices();
      setRebootingId(null);
    }, 3000);
  };

  const handleOpenPingTerminal = (device) => {
    setTerminalDevice(device);
    setTerminalLogs([
      `Initializing ping request to ${device.name} [${device.ipAddress}]...`,
    ]);
    setPinging(false);
  };

  const runPingSimulation = () => {
    if (!terminalDevice || pinging) return;
    setPinging(true);
    
    let count = 0;
    const interval = setInterval(() => {
      count++;
      const latency = (Math.random() * 3 + (terminalDevice.status === 'Issues' ? 15 : 0.8)).toFixed(1);
      const isSuccess = terminalDevice.status !== 'Offline';

      if (isSuccess) {
        setTerminalLogs(prev => [
          ...prev,
          `64 bytes from ${terminalDevice.ipAddress}: icmp_seq=${count} ttl=64 time=${latency} ms`
        ]);
      } else {
        setTerminalLogs(prev => [
          ...prev,
          `Request timeout for icmp_seq ${count}`
        ]);
      }

      if (count >= 4) {
        clearInterval(interval);
        setPinging(false);
        setTerminalLogs(prev => [
          ...prev,
          `--- ${terminalDevice.ipAddress} ping statistics ---`,
          `4 packets transmitted, ${isSuccess ? 4 : 0} packets received, ${isSuccess ? 0 : 100}% packet loss`,
          `round-trip min/avg/max = ${latency}/${(parseFloat(latency) * 1.1).toFixed(1)}/${(parseFloat(latency) * 1.3).toFixed(1)} ms`
        ]);
      }
    }, 800);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Infrastruktur & Perangkat Jaringan</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Monitoring status real-time router, switch distributif, dan wireless access point kampus.</p>
        </div>
      </div>

      {/* Grid Perangkat */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {devices.map(device => {
            const isRebooting = rebootingId === device.id;
            
            // Get Icon
            let Icon = Network;
            if (device.type === 'Router') Icon = Server;
            else if (device.type === 'Access Point') Icon = Wifi;

            // Status design
            let statusColor = 'bg-emerald-500';
            let statusBg = 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-900/30';
            
            if (device.status === 'Offline') {
              statusColor = 'bg-slate-400 dark:bg-slate-600';
              statusBg = 'bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700';
            } else if (device.status === 'Issues') {
              statusColor = 'bg-amber-500';
              statusBg = 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-200/50 dark:border-amber-900/30';
            }

            return (
              <div 
                key={device.id}
                className="glass-panel rounded-2xl overflow-hidden flex flex-col justify-between"
              >
                {/* Header Card */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/30 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-brand-500 text-white rounded-xl shadow-md shadow-brand-500/10">
                      <Icon size={18} />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">{device.name}</h3>
                      <p className="text-[10px] text-slate-400">{device.type} • IP: {device.ipAddress}</p>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-full flex items-center gap-1 ${statusBg}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusColor} ${device.status === 'Online' && 'animate-pulse'}`} />
                    {isRebooting ? 'Rebooting...' : device.status}
                  </span>
                </div>

                {/* Details Body */}
                <div className="p-5 space-y-4 flex-1 text-xs">
                  <div className="grid grid-cols-2 gap-3 text-slate-600 dark:text-slate-400">
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">Lokasi</p>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{device.location}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-medium uppercase">Uptime</p>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{device.uptime}</p>
                    </div>
                    {device.ports && (
                      <div className="col-span-2">
                        <p className="text-[10px] text-slate-400 font-medium uppercase">Konektivitas Port</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{device.ports}</p>
                      </div>
                    )}
                    {device.clients !== undefined && (
                      <div>
                        <p className="text-[10px] text-slate-400 font-medium uppercase">Jumlah Client</p>
                        <p className="font-bold text-slate-700 dark:text-slate-300">{device.clients} Perangkat</p>
                      </div>
                    )}
                  </div>

                  {/* Traffic / CPU Load Indicator */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className="text-slate-400 uppercase">Beban Trafik / Utilitas</span>
                      <span className="text-slate-700 dark:text-slate-300">{device.load}%</span>
                    </div>
                    <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          device.load > 80 ? 'bg-rose-500' : (device.load > 50 ? 'bg-amber-500' : 'bg-brand-500')
                        }`}
                        style={{ width: `${device.load}%` }} 
                      />
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="p-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/20 flex gap-2">
                  <button
                    onClick={() => handleOpenPingTerminal(device)}
                    disabled={isRebooting || device.status === 'Offline'}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <TerminalIcon size={13} />
                    <span>Ping Test</span>
                  </button>

                  <button
                    onClick={() => handleReboot(device.id, device.name)}
                    disabled={isRebooting}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600/80 text-rose-600 dark:text-rose-400 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Power size={13} />
                    <span>{isRebooting ? 'Restarting' : 'Reboot'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Terminal Ping Modal */}
      {terminalDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/55 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-lg bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 animate-scale-in flex flex-col h-[400px]">
            
            {/* Terminal Header */}
            <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-500" />
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                </div>
                <span className="text-xs text-slate-400 font-mono font-bold ml-2">Console: ping_{terminalDevice.id}.sh</span>
              </div>
              <button 
                onClick={() => setTerminalDevice(null)}
                className="p-1 rounded hover:bg-slate-800 text-slate-400"
              >
                <X size={16} />
              </button>
            </div>

            {/* Terminal Screen */}
            <div className="p-4 flex-1 overflow-y-auto font-mono text-xs text-emerald-400 space-y-1.5 bg-slate-950">
              {terminalLogs.map((log, idx) => (
                <div key={idx} className="leading-normal whitespace-pre-wrap">{log}</div>
              ))}
              {pinging && (
                <div className="text-slate-500 animate-pulse">Running icmp query...</div>
              )}
            </div>

            {/* Terminal Controls */}
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex justify-end gap-2">
              <button 
                onClick={() => setTerminalDevice(null)}
                className="px-4 py-1.5 text-xs rounded bg-slate-800 text-slate-300 font-semibold"
              >
                Keluar
              </button>
              <button 
                onClick={runPingSimulation}
                disabled={pinging}
                className="px-4 py-1.5 text-xs rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={12} className={pinging ? 'animate-spin' : ''} />
                <span>Mulai Ping</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
