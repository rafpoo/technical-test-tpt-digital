import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { categorySchema, type CategoryInput } from '../../lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Props {
  category?: any;
  onClose: () => void;
}

export default function CategoryFormModal({ category, onClose }: Props) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<CategoryInput>(
    category || { name: '', description: '' }
  );

  useEffect(() => {
    if (category) {
      setForm({
        name: category.name,
        description: category.description || '',
      });
    }
  }, [category]);

  const mutation = useMutation({
    mutationFn: async (data: CategoryInput) => {
      if (category) {
        await api.put(`/api/categories/${category.id}`, data);
      } else {
        await api.post('/api/categories', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      onClose();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = categorySchema.safeParse(form);
    if (!result.success) return;
    mutation.mutate(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded w-[500px]">
        <h2 className="text-xl mb-4">{category ? 'Edit' : 'Create'} Category</h2>
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