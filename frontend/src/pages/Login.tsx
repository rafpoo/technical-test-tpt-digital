import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loginSchema, type LoginInput } from '../lib/schemas';
import { setToken } from '../lib/auth';
import api, { getErrorMessage } from '../lib/api';
import { LockClosedIcon } from '@radix-ui/react-icons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function Login() {
  const [form, setForm] = useState<LoginInput>({ username: '', password: '' });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await api.post('/api/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      setToken(data.access_token);
      queryClient.removeQueries({ queryKey: ['auth-verify'] });
      toast({ title: 'Login successful' });
      navigate('/dashboard');
    },
    onError: (error) => {
      toast({ title: 'Login failed', description: getErrorMessage(error, 'Invalid credentials'), variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(form);
    if (!result.success) {
      toast({ title: 'Validation error', description: result.error.message, variant: 'destructive' });
      return;
    }
    mutation.mutate(form);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
            <LockClosedIcon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Product Management</CardTitle>
            <p className="mt-2 text-sm text-slate-500">Sign in to manage inventory, categories, and reports.</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Username</span>
              <Input
                placeholder="admin"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Password</span>
              <Input
                type="password"
                placeholder="Enter password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </label>
            <Button type="submit" disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
