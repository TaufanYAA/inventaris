import { dashboardRepository, DashboardStats } from './repository';

export class DashboardService {
  async getDashboardOverview(): Promise<DashboardStats> {
    try {
      return await dashboardRepository.getStats();
    } catch (err: any) {
      console.error('Gagal mengambil kueri dashboard stats:', err);
      throw new Error(err.message || 'Gagal memuat ringkasan data.');
    }
  }

  async getRecentActivitiesList(): Promise<any[]> {
    try {
      return await dashboardRepository.getRecentActivities();
    } catch (err: any) {
      console.error('Gagal mengambil kueri recent activity:', err);
      throw new Error(err.message || 'Gagal memuat linimasa aktivitas.');
    }
  }

  // NOC Simulation: generates mock real-time latency & bandwidth stats for charts
  generateRealTimeMetrics(historyLength = 10) {
    const data = [];
    const now = new Date();
    
    for (let i = historyLength - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 5000); // 5 sec intervals
      const timeStr = time.toTimeString().split(' ')[0].substring(3); // mm:ss
      
      data.push({
        time: timeStr,
        download: Math.floor(250 + Math.random() * 80), // 250-330 Mbps
        upload: Math.floor(80 + Math.random() * 30),   // 80-110 Mbps
        latency: Math.floor(5 + Math.random() * 8),    // 5-13 ms
        packetLoss: Math.random() > 0.95 ? 1 : 0,       // 0-1 % packet loss
      });
    }
    
    return data;
  }
}
export const dashboardService = new DashboardService();
