import { useQuery } from '@tanstack/react-query';
import { dashboardService } from './service';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  activities: () => [...dashboardKeys.all, 'activities'] as const,
};

// Hook: Get aggregate SQL view stats for dashboard
export function useDashboardStats() {
  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardService.getDashboardOverview(),
    refetchInterval: 30000, // Auto-refetch dashboard stats every 30 seconds
  });
}

// Hook: Get recent activity logs
export function useRecentActivities() {
  return useQuery({
    queryKey: dashboardKeys.activities(),
    queryFn: () => dashboardService.getRecentActivitiesList(),
    refetchInterval: 15000, // Refetch activities list every 15 seconds
  });
}
