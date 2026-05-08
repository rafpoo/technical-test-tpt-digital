import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import { Button } from '@/components/ui/button';
import { useMemo, useState } from 'react';
import CategoryFormModal from './CategoryFormModal';
import type { Category } from '../../lib/schemas';
import ConfirmDialog from '../ui/confirm-dialog';
import { useToast } from '../ui/use-toast';
import { getErrorMessage } from '../../lib/api';
import Skeleton from '../ui/skeleton';

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
});

type CategorySort = 'name' | 'created' | 'updated';

export default function CategoriesTable() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [sortBy, setSortBy] = useState<CategorySort>('name');

  const { data: categories, isLoading, isError, refetch } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<Category[]>('/api/categories');
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      toast({ title: 'Category deleted' });
      setDeletingCategory(null);
    },
    onError: (error) => {
      toast({
        title: 'Could not delete category',
        description: getErrorMessage(error),
        variant: 'destructive',
      });
    },
  });

  const sortedCategories = useMemo(() => {
    const sortableCategories = [...(categories ?? [])];

    return sortableCategories.sort((first, second) => {
      if (sortBy === 'created') {
        return new Date(second.created_at).getTime() - new Date(first.created_at).getTime();
      }

      if (sortBy === 'updated') {
        return new Date(second.updated_at).getTime() - new Date(first.updated_at).getTime();
      }

      return first.name.localeCompare(second.name);
    });
  }, [categories, sortBy]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">Category Directory</h2>
          <p className="mt-1 text-sm text-slate-500">{categories?.length ?? 0} categories available</p>
        </div>
        <div className="grid gap-2 sm:flex-row md:flex">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as CategorySort)}
            className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-700 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
          >
            <option value="name">Sort by name</option>
            <option value="created">Newest created</option>
            <option value="updated">Recently updated</option>
          </select>
          <Button className="w-full md:w-auto" onClick={() => { setEditingCategory(null); setModalOpen(true); }}>Add Category</Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-normal text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Name</th>
              <th className="px-5 py-3 font-semibold">Description</th>
              <th className="px-5 py-3 font-semibold">Created</th>
              <th className="px-5 py-3 font-semibold">Updated</th>
              <th className="px-5 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index}>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-64" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-5 py-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-5 py-4"><Skeleton className="ml-auto h-8 w-28" /></td>
                </tr>
              ))
            ) : null}
            {!isLoading && isError ? (
              <tr>
                <td className="px-5 py-8 text-center" colSpan={5}>
                  <div className="text-red-600">Categories could not be loaded.</div>
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
            {!isLoading && !isError && sortedCategories.length === 0 ? (
              <tr>
                <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>No categories found.</td>
              </tr>
            ) : null}
            {!isLoading && !isError && sortedCategories.map((category) => (
              <tr key={category.id} className="hover:bg-slate-50">
                <td className="px-5 py-4 font-medium text-slate-950">{category.name}</td>
                <td className="max-w-[340px] truncate px-5 py-4 text-slate-500">{category.description || 'No description'}</td>
                <td className="px-5 py-4 text-slate-700">{dateFormatter.format(new Date(category.created_at))}</td>
                <td className="px-5 py-4 text-slate-700">{dateFormatter.format(new Date(category.updated_at))}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => { setEditingCategory(category); setModalOpen(true); }}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeletingCategory(category)} disabled={deleteMutation.isPending}>Delete</Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalOpen && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => setModalOpen(false)}
        />
      )}
      {deletingCategory ? (
        <ConfirmDialog
          title="Delete category?"
          description={`This will permanently delete "${deletingCategory.name}". Products assigned to this category may need review.`}
          isPending={deleteMutation.isPending}
          onCancel={() => setDeletingCategory(null)}
          onConfirm={() => deleteMutation.mutate(deletingCategory.id)}
        />
      ) : null}
    </div>
  );
}
