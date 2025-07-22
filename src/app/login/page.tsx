
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth } from '@/lib/firebase';
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
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

/* ---------- OAuth providers ---------- */
const googleProvider = new GoogleAuthProvider();

const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

/* ---------- Helper ---------- */
function niceError(err: unknown): string {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Incorrect e‑mail or password.';
      case 'auth/popup-closed-by-user':
        return 'Popup closed before completing sign‑in.';
      default:
        return err.message;
    }
  }
  return 'An unknown error occurred.';
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  /* ----- e‑mail / password ----- */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({ title: 'Login successful', description: "You're now logged in." });
      router.replace('/dashboard');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: niceError(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  /* ----- social login (Google or Apple) ----- */
  const handleSocial = async (providerName: 'google' | 'apple') => {
    setIsLoading(true);
    const provider = providerName === 'google' ? googleProvider : appleProvider;

    try {
      await signInWithPopup(auth, provider);
      toast({
        title: 'Login successful',
        description: `Signed in with ${
          providerName.charAt(0).toUpperCase() + providerName.slice(1)
        }.`,
      });
      router.replace('/dashboard');
    } catch (err) {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: niceError(err),
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your e‑mail below to sign in—or use a social account.
          </CardDescription>
        </CardHeader>

        {/* -------- e‑mail / password form -------- */}
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>

            {/* -------- social buttons -------- */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={() => handleSocial('google')}
            >
              Continue with Google
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={isLoading}
              onClick={() => handleSocial('apple')}
            >
              Continue with Apple
            </Button>

            <div className="mt-2 text-center text-sm">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="underline">
                <span>Sign up</span>
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
