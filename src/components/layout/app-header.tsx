
'use client';

import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';
import { Button } from '@/components/ui/button';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

export function AppHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut(auth);
    toast({ title: 'Signed Out', description: "You have been successfully signed out." });
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <div className="flex gap-6 md:gap-10">
          <Logo />
        </div>
        {user && (
          <div className="flex flex-1 items-center justify-end space-x-4">
            <nav className="flex items-center space-x-1">
              <span className="text-sm text-muted-foreground hidden sm:inline-block">Welcome, {user.name}</span>
              <Button variant="ghost" onClick={handleSignOut}>Sign Out</Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
