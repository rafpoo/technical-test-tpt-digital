import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

export default function StatsCards() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard/stats');
      return res.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      <div className="bg-white p-4 rounded shadow">
        <h3>Total Products</h3>
        <p className="text-2xl font-bold"data-testid="stats-products">{data?.total_products}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3>Total Categories</h3>
        <p className="text-2xl font-bold">{data?.total_categories}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3>Inventory Value</h3>
        <p className="text-2xl font-bold">${data?.total_inventory_value?.toFixed(2)}</p>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h3>Low Stock Items</h3>
        <p className="text-2xl font-bold text-red-600">{data?.low_stock_products?.length}</p>
      </div>
    </div>
  );
}
