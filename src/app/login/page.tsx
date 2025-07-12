'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Briefcase, Fingerprint } from 'lucide-react';
import { FaGithub, FaApple, FaGoogle } from 'react-icons/fa';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

const passkeyRegisterSchema = z.object({
  name: z.string().min(2, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type PasskeyRegisterFormValues = z.infer<typeof passkeyRegisterSchema>;

export default function LoginPage() {
  const router = useRouter();
  const {
    login,
    signInWithGoogle,
    signInWithGitHub,
    signInWithApple,
    registerWithPasskey,
    signInWithPasskey,
    isAuthenticated,
    isLoading: authLoading,
  } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const passkeyForm = useForm<PasskeyRegisterFormValues>({
    resolver: zodResolver(passkeyRegisterSchema),
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleAuthAction = async (authPromise: Promise<boolean>, type: string) => {
    setError(null);
    try {
      const success = await authPromise;
      if (success) {
        toast({ title: 'Login Successful', description: `Welcome back!` });
        router.push('/dashboard');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err) {
      const message = (err as Error).message || `Sign-in with ${type} failed. Please try again.`;
      setError(message);
      toast({ variant: 'destructive', title: `${type} Failed`, description: message });
    }
  };
  
  const onLoginSubmit: SubmitHandler<LoginFormValues> = (data) => {
    handleAuthAction(login(data.email, data.password), 'Login');
  };

  const onPasskeyRegisterSubmit: SubmitHandler<PasskeyRegisterFormValues> = (data) => {
     handleAuthAction(registerWithPasskey(data.name, data.email), 'Passkey Registration');
  };
  
  const handlePasskeySignIn = () => {
     handleAuthAction(signInWithPasskey(), 'Passkey');
  };


  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-dashed border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Briefcase className="h-8 w-8" />
          </div>
          <CardTitle className="text-3xl font-headline">Welcome to ShYft</CardTitle>
          <CardDescription>Log in or register to manage your schedule.</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Password / Social</TabsTrigger>
              <TabsTrigger value="passkey">Passkey</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <div className="my-4 grid grid-cols-1 gap-2">
                 <Button variant="outline" className="w-full" onClick={() => handleAuthAction(signInWithGoogle(), 'Google')} disabled={authLoading}>
                  <FaGoogle className="mr-2 h-5 w-5" /> Sign in with Google
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleAuthAction(signInWithGitHub(), 'GitHub')} disabled={authLoading}>
                  <FaGithub className="mr-2 h-5 w-5" /> Sign in with GitHub
                </Button>
                <Button variant="outline" className="w-full" onClick={() => handleAuthAction(signInWithApple(), 'Apple')} disabled={authLoading}>
                  <FaApple className="mr-2 h-5 w-5" /> Sign in with Apple
                </Button>
              </div>
               <div className="my-4 flex items-center">
                <div className="flex-grow border-t border-muted-foreground"></div>
                <span className="mx-4 text-xs uppercase text-muted-foreground">Or</span>
                <div className="flex-grow border-t border-muted-foreground"></div>
              </div>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" {...loginForm.register('email')} />
                  {loginForm.formState.errors.email && <p className="text-sm text-destructive">{loginForm.formState.errors.email.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" {...loginForm.register('password')} />
                  {loginForm.formState.errors.password && <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting || authLoading}>
                  {loginForm.formState.isSubmitting || authLoading ? 'Logging in...' : 'Log In with Email'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="passkey">
               <div className="text-center py-4">
                 <p className="text-sm text-muted-foreground mb-4">Sign in with your fingerprint, face, or security key.</p>
                 <Button className="w-full" onClick={handlePasskeySignIn}>
                   <Fingerprint className="mr-2 h-5 w-5" /> Sign in with a Passkey
                 </Button>
               </div>
               <div className="my-4 flex items-center">
                <div className="flex-grow border-t border-muted-foreground"></div>
                <span className="mx-4 text-xs uppercase text-muted-foreground">Or Create One</span>
                <div className="flex-grow border-t border-muted-foreground"></div>
              </div>
              <form onSubmit={passkeyForm.handleSubmit(onPasskeyRegisterSubmit)} className="space-y-4">
                 <div className="space-y-2">
                  <Label htmlFor="passkey-name">Full Name</Label>
                  <Input id="passkey-name" placeholder="Your Name" {...passkeyForm.register('name')} />
                  {passkeyForm.formState.errors.name && <p className="text-sm text-destructive">{passkeyForm.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passkey-email">Email</Label>
                  <Input id="passkey-email" type="email" placeholder="you@example.com" {...passkeyForm.register('email')} />
                   {passkeyForm.formState.errors.email && <p className="text-sm text-destructive">{passkeyForm.formState.errors.email.message}</p>}
                </div>
                 <Button type="submit" className="w-full" disabled={passkeyForm.formState.isSubmitting || authLoading}>
                  {passkeyForm.formState.isSubmitting || authLoading ? 'Registering...' : 'Register with Passkey'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

        </CardContent>
         <CardFooter className="flex flex-col items-center space-y-2 pt-6">
          <p className="text-sm text-muted-foreground">
            Using a password?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
