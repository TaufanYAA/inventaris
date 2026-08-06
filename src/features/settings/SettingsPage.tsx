import React, { useState, useEffect } from 'react';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { useToast } from '../../shared/components/Toast';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../../lib/supabase';
import { Save, ShieldAlert, School, Mail, Eye, EyeOff, KeyRound, User, Phone, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  // System Settings state
  const [campusName, setCampusName] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [snmpCommunity, setSnmpCommunity] = useState('');
  const [showSnmp, setShowSnmp] = useState(false);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // User Profile state
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Fetch settings & user profile from DB
  useEffect(() => {
    async function loadSettings() {
      setIsLoadingSettings(true);
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('setting_key, setting_value');
        
        if (error) throw error;
        
        if (data) {
          data.forEach(item => {
            if (item.setting_key === 'campus_name') setCampusName(item.setting_value);
            if (item.setting_key === 'alert_email_notification') setAlertEmail(item.setting_value);
            if (item.setting_key === 'snmp_read_community') setSnmpCommunity(item.setting_value);
          });
        }
      } catch (err: any) {
        console.error('Gagal memuat pengaturan:', err);
        toast('error', 'Gagal memuat pengaturan sistem.');
      } finally {
        setIsLoadingSettings(false);
      }
    }

    async function loadUserProfile() {
      if (!user) return;
      setIsLoadingProfile(true);
      try {
        const { data, error } = await supabase
          .from('users')
          .select('full_name, phone_number')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        if (data) {
          setFullName(data.full_name);
          setPhoneNumber(data.phone_number || '');
        }
      } catch (err: any) {
        console.error('Gagal memuat profil:', err);
      } finally {
        setIsLoadingProfile(false);
      }
    }

    loadSettings();
    loadUserProfile();
  }, [user]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const updates = [
        { setting_key: 'campus_name', setting_value: campusName, setting_description: 'Nama Institusi Kampus Utama' },
        { setting_key: 'alert_email_notification', setting_value: alertEmail, setting_description: 'Email penerima laporan kendala otomatis server' },
        { setting_key: 'snmp_read_community', setting_value: snmpCommunity, setting_description: 'Snmp community string untuk network monitoring script' },
      ];
      
      const { error } = await supabase
        .from('system_settings')
        .upsert(updates);

      if (error) throw error;
      toast('success', 'Pengaturan sistem berhasil disimpan.');
    } catch (err: any) {
      toast('error', err.message || 'Gagal menyimpan pengaturan.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          phone_number: phoneNumber,
        })
        .eq('id', user?.id);

      if (error) throw error;
      toast('success', 'Profil Anda berhasil diperbarui. Memuat ulang...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      toast('error', err.message || 'Gagal memperbarui profil.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isLoadingSettings || isLoadingProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
        <p className="text-sm text-slate-500">Memuat konfigurasi & profil...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Pengaturan & Profil
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ubah konfigurasi parameter global sistem serta kelola profil nama akun Anda.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT/MIDDLE: SYSTEM CONFIGURATIONS */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <School className="w-5 h-5 text-sky-500" />
                <h2 className="font-semibold text-slate-800 dark:text-white">Identitas Kampus</h2>
              </div>
              
              <Input
                label="Nama Kampus / Universitas"
                placeholder="e.g. Universitas Teknologi Komputer Indonesia"
                value={campusName}
                onChange={e => setCampusName(e.target.value)}
                required
              />
            </Card>

            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                <h2 className="font-semibold text-slate-800 dark:text-white">Notifikasi Alert & Jaringan</h2>
              </div>

              <Input
                label="Email Notifikasi Insiden"
                type="email"
                placeholder="admin@email.com"
                value={alertEmail}
                onChange={e => setAlertEmail(e.target.value)}
                icon={<Mail className="w-4 h-4 text-slate-400" />}
                required
              />

              <div className="relative">
                <Input
                  label="SNMP Read Community"
                  type={showSnmp ? 'text' : 'password'}
                  placeholder="public-community"
                  value={snmpCommunity}
                  onChange={e => setSnmpCommunity(e.target.value)}
                  icon={<KeyRound className="w-4 h-4 text-slate-400" />}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowSnmp(!showSnmp)}
                  className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showSnmp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Card>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSavingSettings}
                variant="primary"
                icon={isSavingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              >
                {isSavingSettings ? 'Menyimpan...' : 'Simpan Pengaturan Sistem'}
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT SIDE: USER PROFILE EDITOR */}
        <div>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <Card className="p-6 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                <User className="w-5 h-5 text-indigo-500" />
                <h2 className="font-semibold text-slate-800 dark:text-white">Profil Pengguna</h2>
              </div>

              <div className="flex flex-col items-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl mb-2">
                <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-2">
                  <User className="w-8 h-8" />
                </div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{user?.role}</span>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{user?.email}</span>
              </div>

              <Input
                label="Nama Lengkap"
                placeholder="Nama Anda"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                icon={<User className="w-4 h-4 text-slate-400" />}
                required
              />

              <Input
                label="Nomor Telepon / HP"
                placeholder="0812xxxxxxxx"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                icon={<Phone className="w-4 h-4 text-slate-400" />}
              />

              <Button
                type="submit"
                disabled={isSavingProfile}
                variant="primary"
                className="w-full justify-center"
                icon={isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              >
                {isSavingProfile ? 'Menyimpan...' : 'Perbarui Nama Profil'}
              </Button>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
