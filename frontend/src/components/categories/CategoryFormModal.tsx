import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api, { getErrorMessage } from '../../lib/api';
import { categorySchema, type Category, type CategoryInput } from '../../lib/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  category?: Category | null;
  onClose: () => void;
}

export default function CategoryFormModal({ category, onClose }: Props) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [form, setForm] = useState<CategoryInput>(
    category
      ? { name: category.name, description: category.description || '' }
      : { name: '', description: '' }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryInput, string>>>({});

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
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: category ? 'Category updated' : 'Category created' });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Could not save category',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = categorySchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CategoryInput, string>> = {};

      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof CategoryInput | undefined;

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
      <div className="w-full max-w-lg rounded-lg border border-slate-200 bg-white shadow-xl">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-950">{category ? 'Edit Category' : 'Create Category'}</h2>
          <p className="mt-1 text-sm text-slate-500">Categories keep the product catalog organized.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Name</span>
            <Input
              placeholder="Category name"
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
              placeholder="Short category description"
              value={form.description}
              onChange={(e) => {
                setForm({ ...form, description: e.target.value });
                setErrors((current) => ({ ...current, description: undefined }));
              }}
              className="min-h-24 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-950 shadow-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />
            {errors.description ? <p className="text-sm text-red-600">{errors.description}</p> : null}
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
