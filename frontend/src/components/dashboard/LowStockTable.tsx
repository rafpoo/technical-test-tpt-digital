import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';

export default function LowStockTable() {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/api/dashboard/stats');
      return res.data;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="mb-4">Low Stock Products (Stock &lt; 10)</h3>
      <table className="w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Stock</th>
          </tr>
        </thead>
        <tbody>
          {data?.low_stock_products?.map((product: any) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>${product.price}</td>
              <td>{product.category_id}</td>
              <td className="text-red-600 font-bold">{product.stock_quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
