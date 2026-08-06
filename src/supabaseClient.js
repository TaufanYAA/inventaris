import { createClient } from '@supabase/supabase-js';
import * as mockData from './mockData';

// Membaca kredensial dari environment variable (Vite prefix VITE_)
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;
let isMock = true;

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    isMock = false;
    console.log('🔌 Supabase Client terhubung dengan kredensial dari .env');
  } catch (error) {
    console.error('⚠️ Supabase connection failed, menggunakan fallback Local Storage.', error);
  }
} else {
  console.log('ℹ️ Kredensial Supabase kosong. Menggunakan Fallback Local Storage.');
}

// Helper untuk inisialisasi awal database Local Storage jika tidak ada
const initLocalStorage = () => {
  if (!localStorage.getItem('lab_pcs')) {
    localStorage.setItem('lab_pcs', JSON.stringify(mockData.initialPCs));
  }
  if (!localStorage.getItem('lab_network_devices')) {
    localStorage.setItem('lab_network_devices', JSON.stringify(mockData.initialNetworkDevices));
  }
  if (!localStorage.getItem('lab_software_licenses')) {
    localStorage.setItem('lab_software_licenses', JSON.stringify(mockData.initialSoftwareLicenses));
  }
  if (!localStorage.getItem('lab_maintenance_logs')) {
    localStorage.setItem('lab_maintenance_logs', JSON.stringify(mockData.initialMaintenanceLogs));
  }
  if (!localStorage.getItem('lab_loans')) {
    localStorage.setItem('lab_loans', JSON.stringify(mockData.initialLoans));
  }
  if (!localStorage.getItem('lab_loanable_items')) {
    localStorage.setItem('lab_loanable_items', JSON.stringify(mockData.loanableItems));
  }
  if (!localStorage.getItem('lab_internet_logs')) {
    localStorage.setItem('lab_internet_logs', JSON.stringify(mockData.internetLogs));
  }
};

initLocalStorage();

// Interface data manager terpadu (Supabase or Local Storage)
export const db = {
  // PC Inventory
  async getPCs() {
    if (!isMock) {
      const { data, error } = await supabase.from('pcs').select('*').order('id', { ascending: true });
      if (!error) return data;
      console.warn('Supabase error, fallback to local storage:', error.message);
    }
    return JSON.parse(localStorage.getItem('lab_pcs'));
  },

  async updatePC(id, updatedFields) {
    if (!isMock) {
      const { data, error } = await supabase.from('pcs').update(updatedFields).eq('id', id).select();
      if (!error) return data[0];
      console.warn('Supabase error, fallback to local storage:', error.message);
    }
    const pcs = JSON.parse(localStorage.getItem('lab_pcs'));
    const index = pcs.findIndex(pc => pc.id === id);
    if (index !== -1) {
      pcs[index] = { ...pcs[index], ...updatedFields };
      localStorage.setItem('lab_pcs', JSON.stringify(pcs));
      return pcs[index];
    }
    return null;
  },

  // Network Devices
  async getNetworkDevices() {
    if (!isMock) {
      const { data, error } = await supabase.from('network_devices').select('*').order('id', { ascending: true });
      if (!error) return data;
      console.warn('Supabase error, fallback to local storage:', error.message);
    }
    return JSON.parse(localStorage.getItem('lab_network_devices'));
  },

  async updateNetworkDevice(id, updatedFields) {
    if (!isMock) {
      const { data, error } = await supabase.from('network_devices').update(updatedFields).eq('id', id).select();
      if (!error) return data[0];
      console.warn('Supabase error, fallback to local storage:', error.message);
    }
    const devices = JSON.parse(localStorage.getItem('lab_network_devices'));
    const index = devices.findIndex(d => d.id === id);
    if (index !== -1) {
      devices[index] = { ...devices[index], ...updatedFields };
      localStorage.setItem('lab_network_devices', JSON.stringify(devices));
      return devices[index];
    }
    return null;
  },

  // Software Licenses
  async getSoftwareLicenses() {
    if (!isMock) {
      const { data, error } = await supabase.from('software_licenses').select('*').order('id', { ascending: true });
      if (!error) return data;
      console.warn('Supabase error, fallback to local storage:', error.message);
    }
    return JSON.parse(localStorage.getItem('lab_software_licenses'));
  },

  async updateSoftwareLicense(id, updatedFields) {
    if (!isMock) {
      const { data, error } = await supabase.from('software_licenses').update(updatedFields).eq('id', id).select();
      if (!error) return data[0];
      console.warn('Supabase error, fallback to local storage:', error.message);
    }
    const licenses = JSON.parse(localStorage.getItem('lab_software_licenses'));
    const index = licenses.findIndex(l => l.id === id);
    if (index !== -1) {
      licenses[index] = { ...licenses[index], ...updatedFields };
      localStorage.setItem('lab_software_licenses', JSON.stringify(licenses));
      return licenses[index];
    }
    return null;
  },

  // Maintenance Logs
  async getMaintenanceLogs() {
    if (!isMock) {
      const { data, error } = await supabase.from('maintenance_logs').select('*').order('reportDate', { ascending: false });
      if (!error) return data;
      console.warn('Supabase error, fallback to local storage:', error.message);
    }
    return JSON.parse(localStorage.getItem('lab_maintenance_logs'));
  },

  async addMaintenanceLog(log) {
    if (!isMock) {
      const { data, error } = await supabase.from('maintenance_logs').insert([log]).select();
      if (!error) return data[0];
      console.warn('Supabase error, fallback to local storage:', error.message);
    }
    const logs = JSON.parse(localStorage.getItem('lab_maintenance_logs'));
    const newLog = { id: `MNT-${Date.now().toString().slice(-4)}`, ...log };
    logs.unshift(newLog);
    localStorage.setItem('lab_maintenance_logs', JSON.stringify(logs));
    return newLog;
  },

  async updateMaintenanceLog(id, updatedFields) {
    if (!isMock) {
      const { data, error } = await supabase.from('maintenance_logs').update(updatedFields).eq('id', id).select();
      if (!error) return data[0];
      console.warn('Supabase error, fallback to local storage:', error.message);
    }
    const logs = JSON.parse(localStorage.getItem('lab_maintenance_logs'));
    const index = logs.findIndex(l => l.id === id);
    if (index !== -1) {
      logs[index] = { ...logs[index], ...updatedFields };
      localStorage.setItem('lab_maintenance_logs', JSON.stringify(logs));
      return logs[index];
    }
    return null;
  },

  // Loan System (Peminjaman)
  async getLoans() {
    if (!isMock) {
      const { data, error } = await supabase.from('loans').select('*').order('borrowDate', { ascending: false });
      if (!error) return data;
      console.warn('Supabase error, fallback to local storage:', error.message);
    }
    return JSON.parse(localStorage.getItem('lab_loans'));
  },

  async getLoanableItems() {
    return JSON.parse(localStorage.getItem('lab_loanable_items'));
  },

  async addLoan(loan) {
    if (!isMock) {
      const { data, error } = await supabase.from('loans').insert([loan]).select();
      if (!error) return data[0];
      console.warn('Supabase error, fallback to local storage:', error.message);
    }
    const loans = JSON.parse(localStorage.getItem('lab_loans'));
    const newLoan = { id: `L-${Date.now().toString().slice(-4)}`, ...loan };
    loans.unshift(newLoan);
    localStorage.setItem('lab_loans', JSON.stringify(loans));

    // Update stok barang tersedia
    const items = JSON.parse(localStorage.getItem('lab_loanable_items'));
    const itemIndex = items.findIndex(item => item.name === loan.itemName);
    if (itemIndex !== -1 && items[itemIndex].available >= loan.quantity) {
      items[itemIndex].available -= loan.quantity;
      localStorage.setItem('lab_loanable_items', JSON.stringify(items));
    }

    return newLoan;
  },

  async returnLoan(id) {
    if (!isMock) {
      const { data, error } = await supabase.from('loans').update({ status: 'Kembali', returnDate: new Date().toISOString().split('T')[0] }).eq('id', id).select();
      if (!error) return data[0];
      console.warn('Supabase error, fallback to local storage:', error.message);
    }
    const loans = JSON.parse(localStorage.getItem('lab_loans'));
    const index = loans.findIndex(l => l.id === id);
    if (index !== -1) {
      loans[index] = { 
        ...loans[index], 
        status: 'Kembali',
        returnDate: new Date().toISOString().split('T')[0] 
      };
      localStorage.setItem('lab_loans', JSON.stringify(loans));

      // Kembalikan stok barang
      const items = JSON.parse(localStorage.getItem('lab_loanable_items'));
      const itemIndex = items.findIndex(item => item.name === loans[index].itemName);
      if (itemIndex !== -1) {
        items[itemIndex].available = Math.min(items[itemIndex].total, items[itemIndex].available + loans[index].quantity);
        localStorage.setItem('lab_loanable_items', JSON.stringify(items));
      }

      return loans[index];
    }
    return null;
  },

  // Internet Monitoring
  async getInternetLogs() {
    return JSON.parse(localStorage.getItem('lab_internet_logs'));
  },

  async appendInternetLog(log) {
    const logs = JSON.parse(localStorage.getItem('lab_internet_logs'));
    logs.push(log);
    if (logs.length > 20) logs.shift(); // Keep limit to last 20
    localStorage.setItem('lab_internet_logs', JSON.stringify(logs));
    return logs;
  }
};
export { supabase, isMock };
