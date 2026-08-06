import React, { useState, useEffect } from 'react';
import { Card } from '../../shared/components/ui/Card';
import { Input } from '../../shared/components/ui/Input';
import { Button } from '../../shared/components/ui/Button';
import { Modal } from '../../shared/components/ui/Modal';
import { useToast } from '../../shared/components/Toast';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
import { env } from '../../lib/env';
import { Save, ShieldAlert, School, Mail, Eye, EyeOff, KeyRound, User, Phone, Users, Plus, Trash2, Loader2 } from 'lucide-react';

type UserRow = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  roleName: string;
};

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

  // User Management List state
  const [usersList, setUsersList] = useState<UserRow[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Create User state
  const [createUserModalOpen, setCreateUserModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState('Mahasiswa');
  const [isCreatingUser, setIsCreatingUser] = useState(false);

  // Fetch settings, profile, and users
  const loadUsersList = async () => {
    setIsLoadingUsers(true);
    try {
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          phone_number
        `)
        .is('deleted_at', null)
        .order('full_name');

      if (usersError) throw usersError;

      if (usersData) {
        // Fetch all roles & user_roles
        const { data: userRolesData } = await supabase
          .from('user_roles')
          .select('user_id, role_id');

        const { data: rolesData } = await supabase
          .from('roles')
          .select('id, role_name');

        const mapped = usersData.map((u: any) => {
          const relation = userRolesData?.find((ur: any) => ur.user_id === u.id);
          const role = rolesData?.find((r: any) => r.id === relation?.role_id);
          return {
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            phone_number: u.phone_number,
            roleName: role?.role_name || 'Mahasiswa'
          };
        });

        setUsersList(mapped);
      }
    } catch (err: any) {
      console.error('Gagal memuat daftar user:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

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
    loadUsersList();
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

  const handleChangeRole = async (targetUserId: string, newRoleName: string) => {
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('role_name', newRoleName)
        .single();

      if (roleError) throw roleError;

      if (roleData) {
        // 1. Delete old user roles mapping
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', targetUserId);

        // 2. Insert new user roles mapping
        const { error: linkError } = await supabase
          .from('user_roles')
          .insert({
            user_id: targetUserId,
            role_id: roleData.id
          });

        if (linkError) throw linkError;
        toast('success', `Peran user berhasil diubah menjadi ${newRoleName}.`);
        loadUsersList();
      }
    } catch (err: any) {
      toast('error', err.message || 'Gagal mengubah peran user.');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreatingUser(true);
    try {
      // 1. Sign up the user with the temporary client
      const tempClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      });

      const { data: signUpData, error: signUpError } = await tempClient.auth.signUp({
        email: newEmail,
        password: newPassword,
      });

      if (signUpError) throw signUpError;

      const newUser = signUpData.user;
      if (!newUser) throw new Error('Gagal mendaftarkan user auth.');

      // 2. Insert into public.users
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: newUser.id,
          username: newEmail.split('@')[0],
          email: newEmail,
          password_hash: 'auth_managed',
          full_name: newFullName,
          phone_number: newPhone || null,
        });

      if (profileError) throw profileError;

      // 3. Link role in public.user_roles
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('role_name', newRole)
        .single();

      if (roleData) {
        await supabase
          .from('user_roles')
          .insert({
            user_id: newUser.id,
            role_id: roleData.id,
          });
      }

      toast('success', `User ${newFullName} berhasil ditambahkan.`);
      setCreateUserModalOpen(false);
      
      // Clear form
      setNewEmail('');
      setNewPassword('');
      setNewFullName('');
      setNewPhone('');
      setNewRole('Mahasiswa');

      // Refresh list
      loadUsersList();
    } catch (err: any) {
      toast('error', err.message || 'Gagal menambahkan user baru.');
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async (targetUserId: string, name: string) => {
    if (targetUserId === user?.id) {
      toast('error', 'Anda tidak bisa menghapus akun Anda sendiri.');
      return;
    }

    if (!window.confirm(`Apakah Anda yakin ingin menghapus user ${name}?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('users')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', targetUserId);

      if (error) throw error;
      toast('success', `User ${name} berhasil dihapus.`);
      loadUsersList();
    } catch (err: any) {
      toast('error', err.message || 'Gagal menghapus user.');
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
          Pengaturan & Manajemen User
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ubah konfigurasi parameter global, kelola profil, serta atur hak akses peran (*RBAC*) pengguna.
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

      {/* BOTTOM SECTION: USER MANAGEMENT TABLE */}
      {user?.role === 'Admin' && (
        <Card className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-500" />
              <h2 className="font-semibold text-slate-800 dark:text-white">Daftar Pengguna & Hak Akses (RBAC)</h2>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setCreateUserModalOpen(true)}
            >
              Tambah Pengguna
            </Button>
          </div>

          {isLoadingUsers ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 rounded-l-lg">Nama Pengguna</th>
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Nomor Telepon</th>
                    <th scope="col" className="px-6 py-3">Peran (Role)</th>
                    <th scope="col" className="px-6 py-3 rounded-r-lg w-20 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="bg-white dark:bg-slate-950 hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{usr.full_name}</td>
                      <td className="px-6 py-4 font-mono text-xs">{usr.email}</td>
                      <td className="px-6 py-4">{usr.phone_number || '—'}</td>
                      <td className="px-6 py-4">
                        <select
                          value={usr.roleName}
                          onChange={(e) => handleChangeRole(usr.id, e.target.value)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="Admin">Admin</option>
                          <option value="Laboran">Laboran</option>
                          <option value="Teknisi">Teknisi</option>
                          <option value="Operator">Operator</option>
                          <option value="Mahasiswa">Mahasiswa</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleDeleteUser(usr.id, usr.full_name)}
                          className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                          title="Hapus Pengguna"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* ADD NEW USER MODAL FORM */}
      <Modal
        isOpen={createUserModalOpen}
        onClose={() => setCreateUserModalOpen(false)}
        title="Tambah Pengguna Baru"
      >
        <form onSubmit={handleCreateUser} className="space-y-4">
          <Input
            label="Nama Lengkap"
            placeholder="Masukkan nama lengkap"
            value={newFullName}
            onChange={e => setNewFullName(e.target.value)}
            required
          />

          <Input
            label="Alamat Email"
            type="email"
            placeholder="username@labnet.ac.id"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
            required
          />

          <Input
            label="Password Kredensial"
            type="password"
            placeholder="Minimal 6 karakter"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            required
          />

          <Input
            label="Nomor Telepon / HP (opsional)"
            placeholder="0812xxxxxxxx"
            value={newPhone}
            onChange={e => setNewPhone(e.target.value)}
          />

          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="Mahasiswa">Mahasiswa</option>
            <option value="Operator">Operator</option>
            <option value="Teknisi">Teknisi</option>
            <option value="Laboran">Laboran</option>
            <option value="Admin">Admin</option>
          </select>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="outline" onClick={() => setCreateUserModalOpen(false)}>Batal</Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isCreatingUser}
              icon={isCreatingUser ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            >
              {isCreatingUser ? 'Mendaftarkan...' : 'Tambah User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
