import { supabase } from '../../lib/supabase';
import { env } from '../../lib/env';

export interface DashboardStats {
  computers: {
    total: number;
    healthyActive: number;
    slightDamage: number;
    severeDamage: number;
    maintenance: number;
    osBreakdown: { windows11: number; windows10: number; ubuntu: number; debian: number };
  };
  network: {
    totalDevices: number;
    healthyDevices: number;
    inactiveDevices: number;
    maintenanceDevices: number;
    withoutRecentBackup: number;
  };
  assets: {
    totalValue: number;
    lifecycle: {
      planning: number;
      procurement: number;
      installed: number;
      active: number;
      maintenance: number;
      retired: number;
      disposed: number;
    };
  };
  tickets: {
    total: number;
    open: number;
    review: number;
    resolved: number;
    closed: number;
    escalated: number;
  };
  maintenance: {
    totalJobs: number;
    pendingJobs: number;
    inProgressJobs: number;
    resolvedJobs: number;
    cancelledJobs: number;
    totalCosts: number;
  };
}

export class DashboardRepository {
  async getStats(): Promise<DashboardStats> {
    if (env.isDemoMode) {
      // Mock stats matching database_seed.sql values
      return {
        computers: {
          total: 45,
          healthyActive: 43,
          slightDamage: 1,
          severeDamage: 0,
          maintenance: 1,
          osBreakdown: { windows11: 36, windows10: 0, ubuntu: 9, debian: 0 },
        },
        network: {
          totalDevices: 6,
          healthyDevices: 6,
          inactiveDevices: 0,
          maintenanceDevices: 0,
          withoutRecentBackup: 5,
        },
        assets: {
          totalValue: 450000000.0,
          lifecycle: {
            planning: 0,
            procurement: 0,
            installed: 0,
            active: 43,
            maintenance: 1,
            retired: 1,
            disposed: 0,
          },
        },
        tickets: {
          total: 1,
          open: 1,
          review: 0,
          resolved: 0,
          closed: 0,
          escalated: 0,
        },
        maintenance: {
          totalJobs: 1,
          pendingJobs: 0,
          inProgressJobs: 1,
          resolvedJobs: 0,
          cancelledJobs: 0,
          totalCosts: 0.0,
        },
      };
    }

    // Real Supabase queries to views
    const { data: compHealth } = await supabase.from('computer_health_view' as any).select('*').single();
    const { data: netHealth } = await supabase.from('network_health_view' as any).select('*').single();
    const { data: assetSummary } = await supabase.from('asset_summary_view' as any).select('*').single();
    const { data: ticketSummary } = await supabase.from('ticket_summary_view' as any).select('*').single();
    const { data: maintSummary } = await supabase.from('maintenance_summary_view' as any).select('*').single();

    return {
      computers: {
        total: Number(compHealth?.total_computers || 0),
        healthyActive: Number(compHealth?.healthy_active_count || 0),
        slightDamage: Number(compHealth?.slight_damage_count || 0),
        severeDamage: Number(compHealth?.severe_damage_count || 0),
        maintenance: Number(compHealth?.maintenance_count || 0),
        osBreakdown: {
          windows11: Number(compHealth?.os_windows11 || 0),
          windows10: Number(compHealth?.os_windows10 || 0),
          ubuntu: Number(compHealth?.os_ubuntu || 0),
          debian: Number(compHealth?.os_debian || 0),
        },
      },
      network: {
        totalDevices: Number(netHealth?.total_network_devices || 0),
        healthyDevices: Number(netHealth?.healthy_active_devices || 0),
        inactiveDevices: Number(netHealth?.inactive_devices || 0),
        maintenanceDevices: Number(netHealth?.maintenance_devices || 0),
        withoutRecentBackup: Number(netHealth?.devices_without_recent_backup || 0),
      },
      assets: {
        totalValue: Number(assetSummary?.total_procurement_value || 0),
        lifecycle: {
          planning: Number(assetSummary?.lifecycle_planning || 0),
          procurement: Number(assetSummary?.lifecycle_procurement || 0),
          installed: Number(assetSummary?.lifecycle_installed || 0),
          active: Number(assetSummary?.lifecycle_active || 0),
          maintenance: Number(assetSummary?.lifecycle_maintenance || 0),
          retired: Number(assetSummary?.lifecycle_retired || 0),
          disposed: Number(assetSummary?.lifecycle_disposed || 0),
        },
      },
      tickets: {
        total: Number(ticketSummary?.total_tickets || 0),
        open: Number(ticketSummary?.open_tickets || 0),
        review: Number(ticketSummary?.review_tickets || 0),
        resolved: Number(ticketSummary?.resolved_tickets || 0),
        closed: Number(ticketSummary?.closed_tickets || 0),
        escalated: Number(ticketSummary?.escalated_tickets || 0),
      },
      maintenance: {
        totalJobs: Number(maintSummary?.total_maintenance_jobs || 0),
        pendingJobs: Number(maintSummary?.pending_jobs || 0),
        inProgressJobs: Number(maintSummary?.in_progress_jobs || 0),
        resolvedJobs: Number(maintSummary?.resolved_jobs || 0),
        cancelledJobs: Number(maintSummary?.cancelled_jobs || 0),
        totalCosts: Number(maintSummary?.total_maintenance_costs || 0),
      },
    };
  }

  async getRecentActivities(): Promise<any[]> {
    if (env.isDemoMode) {
      return [
        {
          event_time: new Date().toISOString(),
          user_name: 'Budi Santoso, A.Md. (Demo)',
          action_type: 'Edit',
          target_table: 'computers',
          action_description: 'Mengubah kondisi PC-12 menjadi Maintenance',
        },
        {
          event_time: new Date(Date.now() - 3600000).toISOString(),
          user_name: 'Dr. Eng. Hermawan (Demo)',
          action_type: 'Login',
          target_table: 'users',
          action_description: 'User Admin login berhasil',
        },
      ];
    }

    const { data, error } = await supabase
      .from('recent_activity_view' as any)
      .select('*')
      .limit(10);

    if (error) throw error;
    return data || [];
  }
}
export const dashboardRepository = new DashboardRepository();
