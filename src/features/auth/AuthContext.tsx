import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { env } from '../../lib/env';

export type UserRole = 'Admin' | 'Laboran' | 'Teknisi' | 'Operator' | 'Mahasiswa';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Load session
  useEffect(() => {
    if (env.isDemoMode) {
      // Check if demo user session exists in localStorage
      const cached = localStorage.getItem('labnet_demo_session');
      if (cached) {
        setUser(JSON.parse(cached));
      }
      setLoading(false);
      return;
    }

    // Real Supabase session hook
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          await fetchUserRole(session.user.id, session.user.email || '');
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Gagal memuat sesi Supabase:', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        await fetchUserRole(session.user.id, session.user.email || '');
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Helper: Query user roles from DB join tables
  const fetchUserRole = async (userId: string, email: string) => {
    try {
      // 1. Cari user di public.users berdasarkan email (agar sinkron dengan seed data UUID)
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('id, full_name')
        .ilike('email', email)
        .single();

      let targetUserId = userId;
      let fullName = 'Staff User';

      if (!profileError && profile) {
        targetUserId = profile.id;
        fullName = profile.full_name;
      }

      // 2. Cari role berdasarkan targetUserId
      const { data: userRoleData, error } = await supabase
        .from('user_roles')
        .select(`
          role:roles(role_name)
        `)
        .eq('user_id', targetUserId)
        .single();

      if (error) throw error;
      
      const roleName = ((userRoleData as any)?.role?.role_name || 'Mahasiswa') as UserRole;

      setUser({
        id: userId,
        email,
        fullName: fullName,
        role: roleName,
      });
    } catch (err) {
      console.warn('Gagal memuat role khusus, menggunakan role Mahasiswa (fallback):', err);
      setUser({
        id: userId,
        email,
        fullName: 'Lab User',
        role: 'Mahasiswa',
      });
    }
  };

  // Action: Log in
  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (env.isDemoMode) {
        // Simple demo credentials verification
        let role: UserRole = 'Mahasiswa';
        let fullName = 'Aldi Taher (Demo)';
        
        if (email.startsWith('admin')) {
          role = 'Admin';
          fullName = 'Dr. Eng. Hermawan (Demo)';
        } else if (email.startsWith('laboran')) {
          role = 'Laboran';
          fullName = 'Budi Santoso, A.Md. (Demo)';
        } else if (email.startsWith('teknisi')) {
          role = 'Teknisi';
          fullName = 'Rian Hidayat (Demo)';
        }

        if (password !== 'admin123') {
          throw new Error('Kredensial salah. Gunakan password "admin123" untuk akun demo.');
        }

        const demoUser: AuthUser = {
          id: 'demo-user-id-' + role.toLowerCase(),
          email,
          fullName,
          role,
        };

        localStorage.setItem('labnet_demo_session', JSON.stringify(demoUser));
        setUser(demoUser);
        return;
      }

      // Supabase Sign In
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      throw new Error(err.message || 'Gagal login.');
    } finally {
      setLoading(false);
    }
  };

  // Action: Log out
  const logout = async () => {
    setLoading(true);
    try {
      if (env.isDemoMode) {
        localStorage.removeItem('labnet_demo_session');
        setUser(null);
        return;
      }
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
    } catch (err: any) {
      console.error('Gagal keluar sesi:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: check RBAC permissions
  const hasRole = (roles: UserRole[]) => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth harus digunakan di dalam AuthProvider');
  }
  return context;
};
