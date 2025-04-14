import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

export const UnauthorizedPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
      <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
      <h1 className="text-3xl font-bold tracking-tight">Access Denied</h1>
      <p className="mt-4 text-muted-foreground">
        You don't have permission to access this page.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={() => navigate('/')}>
          Go to Dashboard
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go Back
        </Button>
      </div>
    </div>
  );
};
