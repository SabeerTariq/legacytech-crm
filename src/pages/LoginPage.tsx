
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('Login form submitted with:', { email, password });

    try {
      await login(email, password);
      console.log('Login function completed');
    } catch (error) {
      console.error('Login error in form handler:', error);
      // Error is already handled in the auth context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-md bg-brand-teal text-white">
            <span className="text-2xl font-bold">LT</span>
          </div>
          <h1 className="text-3xl font-bold text-primary">Legacy Tech CRM</h1>
          <p className="mt-2 text-muted-foreground">Manage your business operations</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your account</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@legacytech.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <a href="#" className="text-xs text-primary underline">Forgot password?</a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-xs font-medium mb-2 text-blue-700">Demo Accounts:</p>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="font-mono">admin@legacytech.com</span>
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-white rounded"
                        onClick={() => {
                          setEmail('admin@legacytech.com');
                          setPassword('password');
                        }}
                      >
                        Auto-fill
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono">sales@legacytech.com</span>
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-white rounded"
                        onClick={() => {
                          setEmail('sales@legacytech.com');
                          setPassword('password');
                        }}
                      >
                        Auto-fill
                      </button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-mono">pm@legacytech.com</span>
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 bg-white rounded"
                        onClick={() => {
                          setEmail('pm@legacytech.com');
                          setPassword('password');
                        }}
                      >
                        Auto-fill
                      </button>
                    </div>
                  </div>
                  <p className="text-xs mt-2 text-center text-blue-700">Password for all accounts: <span className="font-mono bg-white px-2 py-0.5 rounded">password</span></p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};
