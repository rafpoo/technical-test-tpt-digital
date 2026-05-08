import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import ProductFormModal from './ProductFormModal';
import type { Category, Product } from '../../lib/schemas';
import ConfirmDialog from '../ui/confirm-dialog';
import { useToast } from '../ui/use-toast';
import { getErrorMessage } from '../../lib/api';
import Skeleton from '../ui/skeleton';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

type ProductSort = 'name' | 'price' | 'stock';

export default function ProductsTable() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<ProductSort>('name');

  const { data: products, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', categoryFilter],
    queryFn: async () => {
      const res = await api.get<Product[]>('/api/products', { params: categoryFilter ? { category_id: categoryFilter } : {} });
      return res.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<Category[]>('/api/categories');
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'Product deleted' });
      setDeletingProduct(null);
    },
    onError: (error) => {
      toast({
        title: 'Could not delete product',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const sortedProducts = useMemo(() => {
    const sortableProducts = [...(products ?? [])];

    return sortableProducts.sort((first, second) => {
      if (sortBy === 'price') {
        return first.price - second.price;
      }

      if (sortBy === 'stock') {
        return first.stock_quantity - second.stock_quantity;
      }

      return first.name.localeCompare(second.name);
    });
  }, [products, sortBy]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Product Inventory</h2>
          <p className="mt-1 text-sm text-slate-500">{products?.length ?? 0} products shown</p>
        </div>
        <div className="grid gap-2 sm:flex-row md:flex">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="">All Categories</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ProductSort)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="name">Sort by name</option>
            <option value="price">Sort by price</option>
            <option value="stock">Sort by stock</option>
          </select>
          <Button className="w-full md:w-auto" onClick={() => { setEditingProduct(null); setModalOpen(true); }}>Add Product</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Description</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 text-right font-semibold">Stock</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-56" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-28" /></td>
                  <td className="px-5 py-4"><Skeleton className="ml-auto h-5 w-12" /></td>
                  <td className="px-5 py-4"><Skeleton className="ml-auto h-8 w-28" /></td>
                </tr>
              ))
            ) : null}
            {!isLoading && isError ? (
              <tr>
                <td className="px-5 py-8 text-center" colSpan={6}>
                  <div className="text-red-600">Products could not be loaded.</div>
                  <button
                    type="button"
                    className="mt-2 font-medium text-red-700 underline underline-offset-4"
                    onClick={() => void refetch()}
                  >
                    Retry
                  </button>
                </td>
              </tr>
            ) : null}
            {!isLoading && !isError && sortedProducts.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-center text-slate-500" colSpan={6}>No products found.</td>
              </tr>
            ) : null}
            {!isLoading && !isError && sortedProducts.map((product) => (
              <tr key={product.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-medium text-slate-950">{product.name}</td>
                <td className="max-w-[260px] truncate px-5 py-4 text-slate-500">{product.description || 'No description'}</td>
                <td className="px-5 py-4 text-slate-700">{currency.format(product.price)}</td>
                <td className="px-5 py-4 text-slate-700">
                  {categories?.find((category) => category.id === product.category_id)?.name || 'Unknown'}
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={product.stock_quantity < 10 ? 'rounded-full bg-rose-50 px-2.5 py-1 font-semibold text-rose-700' : 'font-medium text-slate-700'}>
                    {product.stock_quantity}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingProduct(product); setModalOpen(true); }}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeletingProduct(product)} disabled={deleteMutation.isPending}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories || []}
          onClose={() => setModalOpen(false)}
        />
      )}
      {deletingProduct ? (
        <ConfirmDialog
          title="Delete product?"
          description={`This will permanently delete "${deletingProduct.name}" from the product catalog.`}
          isPending={deleteMutation.isPending}
          onCancel={() => setDeletingProduct(null)}
          onConfirm={() => deleteMutation.mutate(deletingProduct.id)}
        />
      ) : null}
    </div>
  );
}
