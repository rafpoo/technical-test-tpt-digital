import { ArchiveIcon, CubeIcon, ExclamationTriangleIcon, TokensIcon } from '@radix-ui/react-icons';
import type { DashboardStats } from '../../lib/schemas';
import Skeleton from '../ui/skeleton';

type StatsCardsProps = {
  stats?: DashboardStats;
  isLoading: boolean;
  isError: boolean;
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function StatsCards({ stats, isLoading, isError }: StatsCardsProps) {
  const cards = [
    {
      label: 'Total Products',
      value: stats?.total_products.toLocaleString() ?? '0',
      icon: CubeIcon,
      tone: 'text-blue-700 bg-blue-50',
    },
    {
      label: 'Total Categories',
      value: stats?.total_categories.toLocaleString() ?? '0',
      icon: ArchiveIcon,
      tone: 'text-cyan-700 bg-cyan-50',
    },
    {
      label: 'Inventory Value',
      value: currency.format(stats?.total_inventory_value ?? 0),
      icon: TokensIcon,
      tone: 'text-emerald-700 bg-emerald-50',
    },
    {
      label: 'Low Stock Items',
      value: stats?.low_stock_products.length.toLocaleString() ?? '0',
      icon: ExclamationTriangleIcon,
      tone: 'text-rose-700 bg-rose-50',
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-500">{card.label}</p>
              {isLoading ? (
                <Skeleton className="mt-4 h-8 w-24" />
              ) : (
                <p className="mt-3 text-3xl font-semibold tracking-normal text-slate-950" data-testid={card.label === 'Total Products' ? 'stats-products' : undefined}>
                  {card.value}
                </p>
              )}
            </div>
            <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${card.tone}`}>
              <card.icon className="h-5 w-5" />
            </span>
          </div>
          {isError ? <p className="mt-3 text-sm text-red-600">Could not load this metric.</p> : null}
        </div>
      ))}
    </div>
  );
}
