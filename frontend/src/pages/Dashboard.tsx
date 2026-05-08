import StatsCards from '../components/dashboard/StatsCards';
import LowStockTable from '../components/dashboard/LowStockTable';

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      <StatsCards />
      <LowStockTable />
    </div>
  );
}
