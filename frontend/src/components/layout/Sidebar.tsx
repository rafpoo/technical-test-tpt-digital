import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { removeToken } from '../../lib/auth';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/products', label: 'Products' },
  { path: '/categories', label: 'Categories' },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="w-64 h-screen bg-gray-900 text-white p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-8">Admin Dashboard</h2>
      <nav className="space-y-2 flex-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`block p-2 rounded ${location.pathname === item.path ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Button
        variant="destructive"
        className="w-full mb-4"
        onClick={async () => {
          removeToken();
          navigate('/login');
        }}
      >
        Logout
      </Button>
      <button
        className="mt-4 w-48 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={async () => {
          const token = localStorage.getItem('token');
          const res = await fetch('http://localhost:8000/api/reports/products', {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'products.csv';
          a.click();
        }}
      >
        Export CSV
      </button>
    </div>
  );
}
