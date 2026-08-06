import React, { useState, useEffect } from 'react';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { useToast } from '../../shared/components/Toast';
import { supabase } from '../../lib/supabase';
import { Save, ShieldAlert, School, Mail, Eye, EyeOff, KeyRound, Settings, Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const { toast } = useToast();
  const [campusName, setCampusName] = useState('');
  const [alertEmail, setAlertEmail] = useState('');
  const [snmpCommunity, setSnmpCommunity] = useState('');
  
  const [showSnmp, setShowSnmp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch settings from DB
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
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
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
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
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
        <p className="text-sm text-slate-500">Memuat konfigurasi sistem...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl p-6">
      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
          Pengaturan Sistem
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Konfigurasi parameter global, SNMP server, & notifikasi alert bot.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* GENERAL SETTINGS */}
          <Card className="p-6 space-y-4">
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

          {/* SECURITY & ALERTS */}
          <Card className="p-6 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h2 className="font-semibold text-slate-800 dark:text-white">Notifikasi Alert & Monitoring</h2>
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
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSaving}
            variant="primary"
            icon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </div>
  );
}
