import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { productSchema, type ProductInput } from '../../lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  product?: any;
  categories: any[];
  onClose: () => void;
}

export default function ProductFormModal({ product, categories, onClose }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductInput>(
    product || { name: '', description: '', price: 0, category_id: '', stock_quantity: 0 }
  );

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name,
        description: product.description || '',
        price: product.price,
        category_id: product.category_id,
        stock_quantity: product.stock_quantity,
      });
    }
  }, [product]);

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
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = productSchema.safeParse(form);
    if (!result.success) return;
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-[500px]">
        <h2 className="text-xl mb-4">{product ? 'Edit' : 'Create'} Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full border rounded p-2"
          />
          <Input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) })}
          />
          <select
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="w-full border rounded p-2"
          >
            <option value="">Select Category</option>
            {categories.map((cat: any) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <Input
            type="number"
            placeholder="Stock Quantity"
            value={form.stock_quantity}
            onChange={(e) => setForm({ ...form, stock_quantity: parseInt(e.target.value) })}
          />
          <div className="flex gap-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          </div>
        </form>
      </div>
    </div>
  );
}