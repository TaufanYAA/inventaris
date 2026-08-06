import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useToast } from '../../shared/components/Toast';
import { Mail, Lock, Eye, EyeOff, Loader2, Network, ShieldCheck } from 'lucide-react';
import { env } from '../../lib/env';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoAccounts, setShowDemoAccounts] = useState(env.isDemoMode);
  
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('warning', 'Silakan isi email dan password Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast('success', 'Selamat datang! Login berhasil.');
      navigate('/');
    } catch (err: any) {
      toast('error', err.message || 'Gagal login. Periksa kembali email dan password Anda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('admin123');
    toast('info', `Mengisi kredensial demo untuk ${demoEmail.split('@')[0]}`);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      {/* LEFT PANEL - ARTWORK / BRANDING */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-gradient-to-tr from-slate-950 via-slate-900 to-sky-950 overflow-hidden items-center justify-center p-12">
        {/* Abstract network mesh/grid effect */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#0284c7_1px,transparent_1px),linear-gradient(to_bottom,#0284c7_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
        
        {/* Glow vector backdrops */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-sky-500/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-[120px]"></div>

        <div className="relative max-w-lg text-center z-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-sky-400 to-blue-600 shadow-xl shadow-sky-400/20 text-white mb-8">
            <Network className="w-10 h-10" />
          </div>
          
          <h1 className="text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
            LabNet Management
          </h1>
          
          <p className="text-slate-400 text-lg leading-relaxed mb-8">
            Sistem terintegrasi untuk pemeliharaan komputer workstation, monitoring infrastruktur jaringan aktif, pelacakan IPAM, dan sirkulasi log sediaan laboratorium kampus.
          </p>

          {/* Feature highlights grid */}
          <div className="grid grid-cols-2 gap-4 text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-1">Asset Monitoring</h3>
              <p className="text-xs text-slate-400">Kontrol spek hardware hybrid & garansi 45 PC.</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <h3 className="font-semibold text-white mb-1">Port Topology</h3>
              <p className="text-xs text-slate-400">Visualisasi port switch, patch panel & backup config.</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - LOGIN CARD CONTAINER */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Header mobil-only logo */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-8">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 text-white">
              <Network className="w-6 h-6" />
            </div>
            <span className="font-extrabold text-2xl bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-100 dark:to-white bg-clip-text text-transparent">
              LabNet
            </span>
          </div>

          <div className="p-8 rounded-2xl glass-panel shadow-2xl border border-slate-200/50 dark:border-slate-800/50 transition-all duration-300">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-1.5">Selamat Datang Kembali</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">Silakan masukkan email kredensial akun Anda.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Alamat Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="user@labnet.ac.id"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300">Password</label>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-100/70 dark:bg-slate-950/40 border border-slate-200/50 dark:border-slate-800/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center py-3 font-semibold text-white transition-all duration-200 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-md shadow-sky-500/20 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  'Masuk Aplikasi'
                )}
              </button>
            </form>

            {/* Demo Account Credentials (shown only in demo mode) */}
            {showDemoAccounts && (
              <div className="mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-2 text-sky-500 mb-3">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Demo Accounts (Password: admin123)</span>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => fillDemoCredentials('admin@labnet.ac.id')}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/30 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                  >
                    <span>Admin: admin@labnet.ac.id</span>
                    <span className="text-[10px] text-sky-500 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-full uppercase">Pilih</span>
                  </button>
                  <button
                    onClick={() => fillDemoCredentials('laboran@labnet.ac.id')}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/30 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                  >
                    <span>Laboran: laboran@labnet.ac.id</span>
                    <span className="text-[10px] text-sky-500 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-full uppercase">Pilih</span>
                  </button>
                  <button
                    onClick={() => fillDemoCredentials('teknisi@labnet.ac.id')}
                    className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-950/30 rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-900 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800"
                  >
                    <span>Teknisi: teknisi@labnet.ac.id</span>
                    <span className="text-[10px] text-sky-500 bg-sky-50 dark:bg-sky-950/50 px-2 py-0.5 rounded-full uppercase">Pilih</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
