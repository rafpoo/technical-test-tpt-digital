import { ArchiveIcon, BarChartIcon, DownloadIcon, ExitIcon, GridIcon } from '@radix-ui/react-icons';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import api, { getErrorMessage } from '@/lib/api';
import { cn } from '@/lib/utils';
import { removeToken } from '../../lib/auth';
import { useToast } from '../ui/use-toast';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: BarChartIcon },
  { path: '/products', label: 'Products', icon: GridIcon },
  { path: '/categories', label: 'Categories', icon: ArchiveIcon },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await api.get('/api/reports/products', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'products.csv';
      link.click();
      window.URL.revokeObjectURL(url);
      toast({ title: 'CSV export started' });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: getErrorMessage(error, 'Please try again after checking your connection.'),
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <aside className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur md:h-screen md:w-72 md:border-b-0 md:border-r md:px-5 md:py-6">
      <div className="flex items-center justify-between gap-3 md:block">
        <Link to="/dashboard" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-bold text-white shadow-sm">
            PM
          </span>
          <span>
            <span className="block text-sm font-semibold uppercase tracking-normal text-blue-700">Product Admin</span>
            <span className="block text-xs text-slate-500">Inventory workspace</span>
          </span>
        </Link>
        <Button
          variant="outline"
          size="sm"
          className="md:hidden"
          onClick={() => {
            removeToken();
            queryClient.removeQueries({ queryKey: ['auth-verify'] });
            navigate('/login');
          }}
        >
          Logout
        </Button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto md:mt-8 md:flex-col md:overflow-visible">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              location.pathname === item.path
                ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </div>

      <div className="mt-6 hidden rounded-lg border border-slate-200 bg-slate-50 p-4 md:block">
        <p className="text-xs font-medium uppercase tracking-normal text-slate-500">Signed in</p>
        <p className="mt-1 truncate text-sm font-semibold text-slate-900">Administrator</p>
      </div>

      <div className="mt-4 grid gap-2 md:absolute md:bottom-6 md:left-5 md:right-5">
        <Button variant="outline" className="justify-start gap-2" onClick={handleExport} disabled={isExporting}>
          <DownloadIcon className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export CSV'}
        </Button>
        <Button
          variant="ghost"
          className="hidden justify-start gap-2 text-slate-600 hover:bg-slate-100 md:flex"
          onClick={() => {
            removeToken();
            queryClient.removeQueries({ queryKey: ['auth-verify'] });
            navigate('/login');
          }}
        >
          <ExitIcon className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}
