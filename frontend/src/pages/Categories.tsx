import CategoriesTable from '../components/categories/CategoriesTable';

export default function Categories() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-700">Catalog</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">Categories</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Maintain the category structure used across your product records.
        </p>
      </div>
      <CategoriesTable />
    </div>
  );
}
