// Dataset awal untuk Sistem Inventaris Lab & Network Management

export const initialPCs = Array.from({ length: 45 }, (_, i) => {
  const idNum = i + 1;
  const pcId = `PC-${idNum.toString().padStart(2, '0')}`;
  const lab = idNum <= 25 ? 'Lab A' : 'Lab B';
  
  // Spesifikasi acak namun realistis
  const ram = idNum % 3 === 0 ? '16 GB' : '8 GB';
  const cpu = idNum % 4 === 0 
    ? 'Intel Core i7-12700' 
    : (idNum % 2 === 0 ? 'Intel Core i5-12400' : 'AMD Ryzen 5 5600X');
  const storage = idNum % 5 === 0 ? '512 GB NVMe SSD + 1 TB HDD' : '512 GB NVMe SSD';
  const gpu = idNum % 3 === 0 
    ? 'NVIDIA RTX 3060 12GB' 
    : 'Intel UHD Graphics 730';
  
  // Status: sebagian offline atau maintenance
  let status = 'Online';
  if (idNum === 7 || idNum === 23) status = 'Offline';
  else if (idNum === 15 || idNum === 38) status = 'Maintenance';

  return {
    id: pcId,
    name: `Workstation ${pcId}`,
    ipAddress: `192.168.${idNum <= 25 ? '1' : '2'}.${10 + idNum}`,
    macAddress: `00:1A:3F:F1:A2:${idNum.toString(16).padStart(2, '0').toUpperCase()}`,
    lab,
    status,
    specs: { cpu, ram, storage, gpu },
    os: 'Windows 11 Pro 23H2',
    software: [
      'Visual Studio Code',
      'Google Chrome',
      'Git',
      'Microsoft Office 2021',
      idNum % 2 === 0 ? 'AutoCAD 2024' : 'Matlab R2023b',
      idNum % 3 === 0 ? 'Node.js' : 'Python 3.11'
    ],
    lastMaintenance: '2026-07-15'
  };
});

export const initialNetworkDevices = [
  {
    id: 'NET-01',
    name: 'Router Utama (MikroTik CCR2004)',
    type: 'Router',
    ipAddress: '192.168.1.1',
    status: 'Online',
    location: 'Ruang Server',
    uptime: '15d 6h 32m',
    load: 42, // %
    ports: '12 Ports SFP+'
  },
  {
    id: 'NET-02',
    name: 'Core Switch (Cisco Catalyst 2960)',
    type: 'Switch',
    ipAddress: '192.168.1.2',
    status: 'Online',
    location: 'Ruang Server',
    uptime: '28d 12h 05m',
    load: 65,
    ports: '24 Ports GigE'
  },
  {
    id: 'NET-03',
    name: 'Switch Lab A (TP-Link SG1024)',
    type: 'Switch',
    ipAddress: '192.168.1.3',
    status: 'Online',
    location: 'Lab A',
    uptime: '9d 4h 12m',
    load: 38,
    ports: '24 Ports GigE'
  },
  {
    id: 'NET-04',
    name: 'Switch Lab B (TP-Link SG1024)',
    type: 'Switch',
    ipAddress: '192.168.2.3',
    status: 'Online',
    location: 'Lab B',
    uptime: '9d 4h 10m',
    load: 44,
    ports: '24 Ports GigE'
  },
  {
    id: 'NET-05',
    name: 'Access Point Lab A (Ubiquiti UniFi AC Pro)',
    type: 'Access Point',
    ipAddress: '192.168.1.10',
    status: 'Online',
    location: 'Lab A (Plafon Tengah)',
    uptime: '4d 18h 40m',
    load: 18,
    clients: 18
  },
  {
    id: 'NET-06',
    name: 'Access Point Lab B (Ubiquiti UniFi AC Pro)',
    type: 'Access Point',
    ipAddress: '192.168.2.10',
    status: 'Online',
    location: 'Lab B (Plafon Tengah)',
    uptime: '4d 18h 35m',
    load: 25,
    clients: 24
  },
  {
    id: 'NET-07',
    name: 'Access Point Koridor (Ubiquiti UniFi Lite)',
    type: 'Access Point',
    ipAddress: '192.168.1.11',
    status: 'Issues', // simulasi kendala ringan
    location: 'Koridor Depan Lab',
    uptime: '0d 2h 15m',
    load: 85,
    clients: 32
  }
];

export const initialSoftwareLicenses = [
  {
    id: 'SW-01',
    name: 'Windows 11 Pro Academic',
    category: 'Sistem Operasi',
    type: 'Volume License',
    purchased: 50,
    used: 45,
    expires: 'Perpetual',
    status: 'Active',
    key: 'W269N-WFGWX-YVC9B-4J6C9-T83GX'
  },
  {
    id: 'SW-02',
    name: 'Microsoft Office LTSC 2021',
    category: 'Produktivitas',
    type: 'KMS Key',
    purchased: 50,
    used: 45,
    expires: 'Perpetual',
    status: 'Active',
    key: 'FNYWH-XB96M-C2QGH-K9T8B-P86GY'
  },
  {
    id: 'SW-03',
    name: 'AutoCAD 2024 Education Suite',
    category: 'Engineering / CAD',
    type: 'Subscription',
    purchased: 30,
    used: 23,
    expires: '2027-02-15',
    status: 'Active',
    key: '555-12345678-EL'
  },
  {
    id: 'SW-04',
    name: 'Matlab R2023b Campus License',
    category: 'Mathematics / Simulation',
    type: 'Concurrent License',
    purchased: 25,
    used: 22,
    expires: '2026-12-31',
    status: 'Active',
    key: 'ML-992384-CAMP'
  },
  {
    id: 'SW-05',
    name: 'Adobe Creative Cloud Suite',
    category: 'Design Kreatif',
    type: 'Named User',
    purchased: 10,
    used: 10,
    expires: '2026-09-10',
    status: 'Warning', // Mendekati kadaluarsa dan penuh
    key: 'CC-USER-ASSIGNED-VIA-CONSOLE'
  }
];

export const initialMaintenanceLogs = [
  {
    id: 'MNT-001',
    pcId: 'PC-15',
    description: 'Bising pada kipas power supply dan BSOD acak',
    reporter: 'Dosen Lab A (Budi, M.T.)',
    reportDate: '2026-08-01',
    scheduledDate: '2026-08-03',
    technician: 'Rian H.',
    status: 'In Progress',
    notes: 'Kipas dibersihkan, RAM dibersihkan pin-nya dengan karet penghapus. Masih uji ketahanan.'
  },
  {
    id: 'MNT-002',
    pcId: 'PC-38',
    description: 'Instalasi AutoCAD 2024 korup dan tidak bisa dibuka',
    reporter: 'Asisten Lab B (Siti)',
    reportDate: '2026-08-04',
    scheduledDate: '2026-08-05',
    technician: 'Ferry K.',
    status: 'Pending',
    notes: 'Rencana install ulang driver GPU dan clean uninstall AutoCAD kemudian re-install.'
  },
  {
    id: 'MNT-003',
    pcId: 'PC-07',
    description: 'Layar tidak tampil (No Signal)',
    reporter: 'Siswa / Mahasiswa',
    reportDate: '2026-07-28',
    scheduledDate: '2026-07-29',
    technician: 'Rian H.',
    status: 'Resolved',
    notes: 'Kabel DisplayPort longgar. Dilakukan penggantian kabel cadangan. Sekarang online normal.'
  },
  {
    id: 'MNT-004',
    pcId: 'PC-23',
    description: 'Koneksi LAN tidak terdeteksi (Unplugged)',
    reporter: 'Asisten Lab A',
    reportDate: '2026-07-30',
    scheduledDate: '2026-07-31',
    technician: 'Ferry K.',
    status: 'Resolved',
    notes: 'Konektor RJ45 rusak/patah klipnya. Dilakukan crimping ulang konektor RJ-45 baru. Tes OK.'
  }
];

export const initialLoans = [
  {
    id: 'L-001',
    borrowerName: 'Aldi Taher',
    borrowerId: '10123001', // NIM
    itemName: 'Projector Epson EB-X06',
    quantity: 1,
    borrowDate: '2026-08-05',
    dueDate: '2026-08-06',
    status: 'Dipinjam',
    purpose: 'Presentasi Proyek Akhir di Ruang Seminar 1'
  },
  {
    id: 'L-002',
    borrowerName: 'Cindy Claudia',
    borrowerId: '10123042',
    itemName: 'Arduino Uno Starter Kit',
    quantity: 2,
    borrowDate: '2026-08-03',
    dueDate: '2026-08-10',
    status: 'Dipinjam',
    purpose: 'Eksperimen sensor IoT untuk Tugas Besar Jaringan Sensor Nirkabel'
  },
  {
    id: 'L-003',
    borrowerName: 'Bambang Pamungkas',
    borrowerId: 'NIP.1989021203',
    itemName: 'Kabel HDMI 10 meter',
    quantity: 1,
    borrowDate: '2026-08-01',
    dueDate: '2026-08-02',
    status: 'Kembali',
    purpose: 'Kuliah Tamu di Aula Utama'
  },
  {
    id: 'L-004',
    borrowerName: 'Denny Sumargo',
    borrowerId: '10122099',
    itemName: 'Mouse Logitech B100',
    quantity: 5,
    borrowDate: '2026-07-28',
    dueDate: '2026-07-30',
    status: 'Kembali',
    purpose: 'Praktikum dadakan di luar ruangan Lab B'
  }
];

export const loanableItems = [
  { name: 'Projector Epson EB-X06', available: 3, total: 5 },
  { name: 'Arduino Uno Starter Kit', available: 8, total: 10 },
  { name: 'Raspberry Pi 4 Model B (4GB)', available: 4, total: 5 },
  { name: 'Mouse Logitech B100', available: 15, total: 20 },
  { name: 'Keyboard Logitech K120', available: 12, total: 15 },
  { name: 'Kabel HDMI 10 meter', available: 5, total: 6 },
  { name: 'Crimping Tools RJ-45 & LAN Tester Set', available: 2, total: 4 }
];

export const internetLogs = [
  { time: '08:00', download: 85, upload: 40, latency: 12, packetLoss: 0 },
  { time: '09:00', download: 120, upload: 55, latency: 15, packetLoss: 0.1 },
  { time: '10:00', download: 180, upload: 72, latency: 25, packetLoss: 0.5 },
  { time: '11:00', download: 195, upload: 88, latency: 32, packetLoss: 1.2 },
  { time: '12:00', download: 110, upload: 45, latency: 18, packetLoss: 0 },
  { time: '13:00', download: 165, upload: 68, latency: 22, packetLoss: 0.2 },
  { time: '14:00', download: 190, upload: 82, latency: 28, packetLoss: 0.8 },
  { time: '15:00', download: 175, upload: 79, latency: 24, packetLoss: 0.4 },
  { time: '16:00', download: 130, upload: 60, latency: 16, packetLoss: 0 },
  { time: '17:00', download: 95, upload: 45, latency: 13, packetLoss: 0 }
];
