import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import { productSchema, type Category, type Product, type ProductInput } from '../../lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  product?: Product | null;
  categories: Category[];
  onClose: () => void;
}

export default function ProductFormModal({ product, categories, onClose }: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<ProductInput>(
    product
      ? {
          name: product.name,
          description: product.description || '',
          price: product.price,
          category_id: product.category_id,
          stock_quantity: product.stock_quantity,
        }
      : { name: '', description: '', price: 0, category_id: '', stock_quantity: 0 }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof ProductInput, string>>>({});

  const mutation = useMutation({
    mutationFn: async (data: ProductInput) => {
      if (product) {
        await api.put(`/api/products/${product.id}`, data);
      } else {
        await api.post('/api/products', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: product ? 'Product updated' : 'Product created' });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Could not save product',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = productSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProductInput, string>> = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof ProductInput | undefined;

        if (field && !fieldErrors[field]) {
          fieldErrors[field] = issue.message;
        }
      }

      setErrors(fieldErrors);
      return;
    }
    setErrors({});
    mutation.mutate(result.data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-6">
      <div className="w-full max-w-xl rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-950">{product ? 'Edit Product' : 'Create Product'}</h2>
          <p className="mt-1 text-sm text-slate-500">Keep product details accurate for inventory reporting.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <Input
              placeholder="Product name"
              value={form.name}
              onChange={(e) => {
                setForm({ ...form, name: e.target.value });
                setErrors((current) => ({ ...current, name: undefined }));
              }}
            />
            {errors.name ? <p className="text-sm text-red-600">{errors.name}</p> : null}
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Description</span>
            <textarea
              placeholder="Short product description"
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value });
                setErrors((current) => ({ ...current, description: undefined }));
              }}
              className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {errors.description ? <p className="text-sm text-red-600">{errors.description}</p> : null}
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Price</span>
              <Input
                type="number"
                placeholder="0.00"
                value={form.price}
                min="0"
                step="0.01"
                onChange={(e) => {
                  setForm({ ...form, price: Number(e.target.value) });
                  setErrors((current) => ({ ...current, price: undefined }));
                }}
              />
              {errors.price ? <p className="text-sm text-red-600">{errors.price}</p> : null}
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Stock Quantity</span>
              <Input
                type="number"
                placeholder="0"
                value={form.stock_quantity}
                min="0"
                step="1"
                onChange={(e) => {
                  setForm({ ...form, stock_quantity: Number.parseInt(e.target.value, 10) || 0 });
                  setErrors((current) => ({ ...current, stock_quantity: undefined }));
                }}
              />
              {errors.stock_quantity ? <p className="text-sm text-red-600">{errors.stock_quantity}</p> : null}
            </label>
          </div>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Category</span>
            <select
              value={form.category_id}
              onChange={(e) => {
                setForm({ ...form, category_id: e.target.value });
                setErrors((current) => ({ ...current, category_id: undefined }));
              }}
              className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category_id ? <p className="text-sm text-red-600">{errors.category_id}</p> : null}
          </label>
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
