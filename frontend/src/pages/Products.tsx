import ProductsTable from '../components/products/ProductsTable';

export default function Products() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-700">Catalog</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">Products</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">
          Review product inventory, stock status, and category assignments.
        </p>
      </div>
      <ProductsTable />
    </div>
  );
}
