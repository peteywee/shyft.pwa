
'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
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
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [payRate, setPayRate] = useState(user?.payRate?.toString() || '');
  const [isSaving, setIsSaving] = useState(false);
  
  // Update state when user object is loaded
  useState(() => {
    if (user) {
      setName(user.name);
      setPayRate(user.payRate?.toString() || '');
    }
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true);

    try {
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, {
        name,
        payRate: parseFloat(payRate) || 0,
      });
      toast({ title: 'Profile Updated', description: 'Your information has been saved.' });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: 'Could not save your profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent className="grid gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <div className="container mx-auto py-8">Please log in to view your profile.</div>;
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Your Profile</CardTitle>
          <CardDescription>
            Update your personal information here.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleProfileUpdate}>
          <CardContent className="grid gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={user.email} disabled />
              <p className="text-sm text-muted-foreground">
                Email address cannot be changed.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="payRate">Pay Rate ($/hour)</Label>
              <Input
                id="payRate"
                type="number"
                value={payRate}
                onChange={(e) => setPayRate(e.target.value)}
                required
                disabled={user.role !== 'management'}
              />
              {user.role !== 'management' && (
                 <p className="text-sm text-muted-foreground">
                    Pay rate can only be adjusted by management.
                  </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
