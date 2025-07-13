'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Icons } from '@/components/icons'; // Assuming you have an icons component for social logos

export default function LoginPage() {
  const { 
    login, 
    signInWithGoogle, 
    signInWithGitHub, 
    signInWithPasskey, 
    isLoading, 
    isAuthenticated 
  } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleAuthAction = async (action: () => Promise<boolean>, successMessage: string, errorMessage: string) => {
    const success = await action();
    if (success) {
      toast({ title: 'Success', description: successMessage });
      router.push('/dashboard');
    } else {
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
    }
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please enter both email and password.' });
      return;
    }
    handleAuthAction(
      () => login(email, password),
      'You have successfully logged in.',
      'Login failed. Please check your credentials.'
    );
  };
  
  const handleSocialLogin = (provider: 'google' | 'github') => {
    const action = provider === 'google' ? signInWithGoogle : signInWithGitHub;
    handleAuthAction(
      action,
      `Successfully signed in with ${provider}.`,
      `Failed to sign in with ${provider}.`
    );
  };

  const handlePasskeySignIn = () => {
     handleAuthAction(
      signInWithPasskey,
      'Successfully signed in with Passkey.',
      'Failed to sign in with Passkey. Please try again.'
    );
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Choose your preferred login method.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-2 gap-2">
             <Button variant="outline" onClick={() => handleSocialLogin('google')} disabled={isLoading}>
              <Icons.google className="mr-2 h-4 w-4" />
              Google
            </Button>
            <Button variant="outline" onClick={() => handleSocialLogin('github')} disabled={isLoading}>
              <Icons.gitHub className="mr-2 h-4 w-4" />
              GitHub
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
             <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Loading...' : 'Sign In with Email'}
            </Button>
          </form>

          <Separator />
          
          <Button onClick={handlePasskeySignIn} variant="outline" className="w-full" disabled={isLoading}>
            <Icons.passkey className="mr-2 h-4 w-4" />
            Sign in with a Passkey
          </Button>

        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <div className="text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-semibold underline">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
