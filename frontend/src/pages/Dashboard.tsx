import { useQuery } from '@tanstack/react-query';
import StatsCards from '../components/dashboard/StatsCards';
import LowStockTable from '../components/dashboard/LowStockTable';
import api from '../lib/api';
import type { Category, DashboardStats } from '../lib/schemas';

export default function Dashboard() {
  const statsQuery = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await api.get<DashboardStats>('/api/dashboard/stats');
      return response.data;
    },
  });

  const categoriesQuery = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get<Category[]>('/api/categories');
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-blue-700">Overview</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">Dashboard</h1>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm">
          Low stock threshold: <span className="font-semibold text-slate-800">10 units</span>
        </div>
      </div>
      {statsQuery.isError ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <div className="font-semibold">Dashboard data could not be loaded.</div>
          <button
            type="button"
            className="mt-2 font-medium text-red-900 underline underline-offset-4"
            onClick={() => void statsQuery.refetch()}
          >
            Retry
          </button>
        </div>
      ) : null}
      <StatsCards stats={statsQuery.data} isLoading={statsQuery.isLoading} isError={statsQuery.isError} />
      <LowStockTable
        products={statsQuery.data?.low_stock_products ?? []}
        categories={categoriesQuery.data ?? []}
        isLoading={statsQuery.isLoading}
        isError={statsQuery.isError}
      />
    </div>
  );
}
