import type { Category, Product } from '../../lib/schemas';
import Skeleton from '../ui/skeleton';

type LowStockTableProps = {
  products: Product[];
  categories: Category[];
  isLoading: boolean;
  isError: boolean;
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export default function LowStockTable({ products, categories, isLoading, isError }: LowStockTableProps) {
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Low Stock Products</h2>
          <p className="mt-1 text-sm text-slate-500">Products with fewer than 10 units remaining.</p>
        </div>
        <span className="w-fit rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">
          {isLoading ? '...' : products.length} flagged
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Description</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 text-right font-semibold">Stock</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-56" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-5 py-4"><Skeleton className="ml-auto h-6 w-12 rounded-full" /></td>
                </tr>
              ))
            ) : null}
            {!isLoading && isError ? (
              <tr>
                <td className="px-5 py-8 text-center text-red-600" colSpan={5}>
                  Could not load low stock products.
                </td>
              </tr>
            ) : null}
            {!isLoading && !isError && products.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>
                  No low stock products right now.
                </td>
              </tr>
            ) : null}
            {!isLoading && !isError
              ? products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-950">{product.name}</td>
                    <td className="max-w-[260px] truncate px-5 py-4 text-slate-500">
                      {product.description || 'No description'}
                    </td>
                    <td className="px-5 py-4 text-slate-700">{currency.format(product.price)}</td>
                    <td className="px-5 py-4 text-slate-700">{categoryNameById.get(product.category_id) ?? 'Unknown'}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-rose-700">
                        {product.stock_quantity}
                      </span>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
