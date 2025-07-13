'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/types';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { UserFormDialog as UserForm } from './_components/user-form-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Edit } from 'lucide-react';

export default function UsersPage() {
  const { user: currentUser, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && currentUser?.role !== 'management') {
      toast({
        variant: 'destructive',
        title: 'Access Denied',
        description: 'You must be a manager to view this page.',
      });
      router.replace('/dashboard');
    }
  }, [currentUser, isAuthLoading, router, toast]);

  useEffect(() => {
    if (currentUser?.role === 'management') {
      const unsubscribe = onSnapshot(collection(db, 'users'), 
        (snapshot) => {
          const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
          setUsers(usersData);
          setIsDataLoading(false);
        }, 
        (error) => {
          console.error('Error fetching users:', error);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch users.' });
          setIsDataLoading(false);
        }
      );
      return () => unsubscribe();
    }
  }, [currentUser, toast]);
  
  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      const idToken = await currentUser?.getIdToken();
      if (!idToken) {
        throw new Error("Authentication token not available.");
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save user.');
      }
      
      const successTitle = userData.id ? 'User Updated' : 'User Added';
      const successDescription = userData.id ? 'The user details have been saved.' : 'A new user has been created.';
      toast({ title: successTitle, description: successDescription });

    } catch (error) {
      console.error('Error saving user: ', error);
      const message = error instanceof Error ? error.message : 'Could not save user details.';
      toast({ variant: 'destructive', title: 'Error', description: message });
    }
  };

  if (isAuthLoading || currentUser?.role !== 'management') {
    return (
       <Card>
        <CardHeader>
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent><div className="space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /><Skeleton className="h-10 w-full" /></div></CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>User Management</CardTitle>
          <CardDescription>View, add, or edit user roles and information.</CardDescription>
        </div>
        <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add User</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add New User</DialogTitle></DialogHeader>
            <UserForm onSave={handleSaveUser} closeDialog={() => setIsAddUserDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {isDataLoading ? (
              <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading users...</TableCell></TableRow>
            ) : (
              users.map((user) => (
                 <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell><Badge variant={user.role === 'management' ? 'default' : 'secondary'}>{user.role}</Badge></TableCell>
                  <TableCell className="text-right">
                     <Dialog>
                        <DialogTrigger asChild>
                           <Button variant="ghost" size="icon"><Edit className="h-4 w-4" /></Button>
                        </DialogTrigger>
                        <DialogContent>
                           <DialogHeader><DialogTitle>Edit User</DialogTitle></DialogHeader>
                           <UserForm userData={user} onSave={handleSaveUser} closeDialog={() => {
                              // This is a bit of a hack to close the dialog. A better solution
                              // would be to manage the dialog state in a more granular way.
                              const closeButton = document.querySelector('[data-radix-dialog-close]');
                              if (closeButton instanceof HTMLElement) {
                                closeButton.click();
                              }
                           }} />
                        </DialogContent>
                     </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
