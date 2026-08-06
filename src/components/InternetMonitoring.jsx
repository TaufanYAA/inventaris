import React, { useState, useEffect } from 'react';
import { db } from '../supabaseClient';
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
import { 
  Activity, 
  Gauge, 
  ArrowDown, 
  ArrowUp, 
  CheckCircle2, 
  Network,
  RefreshCw
} from 'lucide-react';

export default function InternetMonitoring() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState({
    download: 175.4,
    upload: 78.2,
    latency: 14,
    packetLoss: 0.4
  });

  // Speed Test states
  const [testState, setTestState] = useState('idle'); // idle | testing-down | testing-up | complete
  const [testProgress, setTestProgress] = useState(0);
  const [testResults, setTestResults] = useState({ download: 0, upload: 0, latency: 0 });

  const loadLogs = async () => {
    try {
      const data = await db.getInternetLogs();
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

  // Live simulation tick (fluctuates bandwidth every 3 seconds to show live charts)
  useEffect(() => {
    if (loading || testState !== 'idle') return;

    const interval = setInterval(async () => {
      // Fluctuate speed slightly
      const speedDiffDown = (Math.random() * 20 - 10);
      const speedDiffUp = (Math.random() * 10 - 5);
      const latencyDiff = Math.floor(Math.random() * 6 - 3);

      const nextDown = Math.max(50, Math.min(250, +(currentSpeed.download + speedDiffDown).toFixed(1)));
      const nextUp = Math.max(20, Math.min(100, +(currentSpeed.upload + speedDiffUp).toFixed(1)));
      const nextLatency = Math.max(5, Math.min(60, currentSpeed.latency + latencyDiff));
      const nextLoss = Math.max(0, Math.min(5, +(Math.random() * 0.8).toFixed(2)));

      const newSpeed = {
        download: nextDown,
        upload: nextUp,
        latency: nextLatency,
        packetLoss: nextLoss
      };

      setCurrentSpeed(newSpeed);

      // Append to db logs
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      
      const newLogs = await db.appendInternetLog({
        time: timeStr,
        download: nextDown,
        upload: nextUp,
        latency: nextLatency,
        packetLoss: nextLoss
      });

      setLogs([...newLogs]);
    }, 4000);

    return () => clearInterval(interval);
  }, [loading, currentSpeed, testState]);

  // Run interactive speed test simulation
  const startSpeedTest = () => {
    setTestState('testing-down');
    setTestProgress(0);
    setTestResults({ download: 0, upload: 0, latency: 12 });

    let progress = 0;
    
    // Download phase
    const downInterval = setInterval(() => {
      progress += 5;
      setTestProgress(progress);
      
      // Random climbing speed
      const curDown = Math.floor(Math.random() * 80) + 120;
      setTestResults(prev => ({ ...prev, download: curDown }));

      if (progress >= 50) {
        clearInterval(downInterval);
        setTestState('testing-up');
        
        // Upload phase
        const upInterval = setInterval(() => {
          progress += 5;
          setTestProgress(progress);

          const curUp = Math.floor(Math.random() * 30) + 60;
          setTestResults(prev => ({ ...prev, upload: curUp }));

          if (progress >= 100) {
            clearInterval(upInterval);
            setTestState('complete');
            
            // Finalize results and merge back to current status
            const finalResults = {
              download: +(180 + Math.random() * 30).toFixed(1),
              upload: +(75 + Math.random() * 15).toFixed(1),
              latency: Math.floor(Math.random() * 4) + 10,
              packetLoss: +(Math.random() * 0.2).toFixed(2)
            };

            setTestResults(finalResults);
            setCurrentSpeed(finalResults);

            // Add final speed test to graphs
            const now = new Date();
            const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} (Test)`;
            
            db.appendInternetLog({
              time: timeStr,
              download: finalResults.download,
              upload: finalResults.upload,
              latency: finalResults.latency,
              packetLoss: finalResults.packetLoss
            }).then(newLogs => setLogs([...newLogs]));

            // Reset back to idle after 4 seconds
            setTimeout(() => {
              setTestState('idle');
            }, 4000);
          }
        }, 200);
      }
    }, 200);
  };

  return (
    <div className="space-y-6 animate-slide-in">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">Monitoring Internet Kampus</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Analisis latency ping, utilisasi bandwidth download/upload secara real-time.</p>
        </div>
      </div>

      {/* Top Cards - Real-time statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Latency */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ping Latency</span>
            <span className="px-2 py-0.5 text-[9px] font-extrabold rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-200/50">Lancar</span>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{currentSpeed.latency}</span>
            <span className="text-sm font-semibold text-slate-500">ms</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Target ping: Google DNS (8.8.8.8)</p>
        </div>

        {/* Download Speed */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kecepatan Unduh</span>
            <div className="p-1 rounded-md bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500">
              <ArrowDown size={14} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{currentSpeed.download}</span>
            <span className="text-sm font-semibold text-slate-500">Mbps</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Kapasitas Dedicated: 300 Mbps</p>
        </div>

        {/* Upload Speed */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Kecepatan Unggah</span>
            <div className="p-1 rounded-md bg-sky-50 dark:bg-sky-950/20 text-sky-500">
              <ArrowUp size={14} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{currentSpeed.upload}</span>
            <span className="text-sm font-semibold text-slate-500">Mbps</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Kapasitas Dedicated: 100 Mbps</p>
        </div>

        {/* Packet Loss */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Packet Loss</span>
            <span className="px-2 py-0.5 text-[9px] font-extrabold rounded bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-200/50">Optimal</span>
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{currentSpeed.packetLoss}</span>
            <span className="text-sm font-semibold text-slate-500">%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Batas aman sistem &lt; 2.0%</p>
        </div>

      </div>

      {/* Main Area: Speed Test panel & Recharts graph */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Speed Test Panel (1/3) */}
        <div className="glass-panel rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 uppercase tracking-wider">
              <Gauge size={14} className="text-brand-500" />
              Internet Speed Test
            </h3>
            <p className="text-[11px] text-slate-500 leading-normal">Uji kecepatan uplink/downlink server lab langsung ke gerbang router internet utama kampus.</p>
          </div>

          {/* Tester UI Display */}
          <div className="my-6 text-center space-y-3">
            {testState === 'idle' ? (
              <div className="h-32 flex flex-col items-center justify-center space-y-2">
                <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-950/20 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <Activity size={32} />
                </div>
                <p className="text-[11px] text-slate-400">Siap melakukan pengujian</p>
              </div>
            ) : testState === 'complete' ? (
              <div className="h-32 flex flex-col items-center justify-center space-y-2 animate-scale-in">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 size={24} />
                </div>
                <div className="grid grid-cols-2 gap-4 text-left w-full max-w-[200px] mt-1 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Download</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{testResults.download} Mb/s</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400">Upload</span>
                    <p className="font-bold text-slate-800 dark:text-slate-100">{testResults.upload} Mb/s</p>
                  </div>
                </div>
              </div>
            ) : (
              // Testing Progress UI
              <div className="h-32 flex flex-col items-center justify-center space-y-3">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-slate-100 dark:text-slate-800"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className="text-brand-500 transition-all duration-300"
                      strokeWidth="3"
                      strokeDasharray={`${testProgress}, 100`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <p className="text-[9px] uppercase font-bold text-slate-400">
                      {testState === 'testing-down' ? 'Download' : 'Upload'}
                    </p>
                    <p className="text-base font-extrabold text-slate-800 dark:text-slate-100">
                      {testState === 'testing-down' ? testResults.download : testResults.upload}
                    </p>
                    <p className="text-[9px] text-slate-400">Mbps</p>
                  </div>
                </div>
                <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-500 rounded-full transition-all duration-300" style={{ width: `${testProgress}%` }} />
                </div>
              </div>
            )}
          </div>

          <button
            onClick={startSpeedTest}
            disabled={testState !== 'idle'}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-brand-600/15 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} className={testState !== 'idle' ? 'animate-spin' : ''} />
            <span>{testState !== 'idle' ? 'Menguji Jaringan...' : 'Mulai Jalankan Tes'}</span>
          </button>
        </div>

        {/* Line Chart Panel (2/3) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 flex flex-col justify-between min-h-[350px]">
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Histori Kinerja Bandwidth</h3>
            <p className="text-[11px] text-slate-400">Menampilkan beban download (biru) dan upload (hijau) dalam Mbps selama beberapa jam terakhir.</p>
          </div>

          {/* Recharts Component */}
          {loading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
            </div>
          ) : (
            <div className="h-56 w-full mt-4 text-[10px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={logs} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="time" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(30, 41, 59, 0.9)', 
                      borderColor: 'rgba(71, 85, 105, 0.5)',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontSize: '11px'
                    }} 
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', marginTop: '10px' }} />
                  <Area type="monotone" name="Download Speed" dataKey="download" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#colorDown)" />
                  <Area type="monotone" name="Upload Speed" dataKey="upload" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorUp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
