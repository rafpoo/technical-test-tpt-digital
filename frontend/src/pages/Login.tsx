import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { loginSchema, type LoginInput } from '../lib/schemas';
import { setToken } from '../lib/auth';
import api from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export default function Login() {
  const [form, setForm] = useState<LoginInput>({ username: '', password: '' });
  const navigate = useNavigate();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: async (data: LoginInput) => {
      const res = await api.post('/api/auth/login', data);
      return res.data;
    },
    onSuccess: (data) => {
      setToken(data.access_token);
      toast({ title: 'Login successful' });
      navigate('/dashboard');
    },
    onError: () => {
      toast({ title: 'Login failed', description: 'Invalid credentials', variant: 'destructive' });
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
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Product Management Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <Input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button type="submit" disabled={mutation.isPending} className="w-full">
              {mutation.isPending ? 'Logging in...' : 'Login'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
