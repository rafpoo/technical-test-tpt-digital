import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../lib/api';
import { isAuthenticated, removeToken } from '../../lib/auth';
import SidebarLayout from './SidebarLayout';

export default function AuthGuard() {
  const navigate = useNavigate();

  const verifyQuery = useQuery({
    queryKey: ['auth-verify'],
    queryFn: async () => {
      const response = await api.get<{ valid: boolean; user_id: string }>('/api/auth/verify');
      return response.data;
    },
    enabled: isAuthenticated(),
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    const handleExpired = () => {
      navigate('/login', { replace: true });
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => window.removeEventListener('auth:expired', handleExpired);
  }, [navigate]);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (verifyQuery.isLoading || verifyQuery.isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          Verifying session...
        </div>
      </div>
    );
  }

  if (verifyQuery.isError || verifyQuery.data?.valid !== true) {
    removeToken();
    return <Navigate to="/login" replace />;
  }

  return <SidebarLayout />;
}
