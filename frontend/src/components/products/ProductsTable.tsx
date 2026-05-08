import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import ProductFormModal from './ProductFormModal';

export default function ProductsTable() {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const { data: products, isLoading } = useQuery({
    queryKey: ['products', categoryFilter],
    queryFn: async () => {
      const res = await api.get('/api/products', { params: categoryFilter ? { category_id: categoryFilter } : {} });
      return res.data;
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/api/categories');
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between mb-4">
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border rounded p-2">
          <option value="">All Categories</option>
          {categories?.map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        <Button onClick={() => { setEditingProduct(null); setModalOpen(true); }>Add Product</Button>
      </div>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((product: any) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>${product.price}</td>
              <td>{categories?.find((c: any) => c.id === product.category_id)?.name || 'Unknown'}</td>
              <td className={product.stock_quantity < 10 ? 'text-red-600 font-bold' : ''}>{product.stock_quantity}</td>
              <td>
                <Button variant="outline" size="sm" onClick={() => { setEditingProduct(product); setModalOpen(true); }>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(product.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          categories={categories || []}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}