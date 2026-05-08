import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import CategoryFormModal from './CategoryFormModal';

export default function CategoriesTable() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/api/categories');
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditingCategory(null); setModalOpen(true); }}>Add Category</Button>
      </div>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Created At</th>
            <th>Updated At</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories?.map((category: any) => (
            <tr key={category.id}>
              <td>{category.name}</td>
              <td>{category.description}</td>
              <td>{new Date(category.created_at).toLocaleDateString()}</td>
              <td>{new Date(category.updated_at).toLocaleDateString()}</td>
              <td>
                <Button variant="outline" size="sm" onClick={() => { setEditingCategory(category); setModalOpen(true); }}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => deleteMutation.mutate(category.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {modalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setModalOpen(false)}
        />
      )}
    </div>
  );
}
