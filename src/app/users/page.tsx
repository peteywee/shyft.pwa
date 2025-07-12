
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  addDoc
} from 'firebase/firestore';

import type { User } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit3, Trash2, ShieldCheck, User as UserIcon, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { UserFormDialog } from './_components/user-form-dialog';
import { MOCK_USER } from '@/lib/mock-user';


export default function UsersPage() {
  const currentUser = MOCK_USER; 
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    if (currentUser?.role !== 'management') {
      router.replace('/dashboard');
      toast({ variant: 'destructive', title: 'Access Denied', description: 'You do not have permission to view this page.' });
      return;
    }

    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      toast({ variant: "destructive", title: "Firestore Error", description: "Could not fetch users. Check your Firebase connection." });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, router, toast]);
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsUserDialogOpen(true);
  };
  
  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserDialogOpen(true);
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast({ title: "User Record Deleted", description: "The user's data has been removed from Firestore." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete user record." });
    }
  };

  const handleSaveUser = async (userData: Partial<User>) => {
    try {
      if (userData.id) { // Editing existing user
        const userDocRef = doc(db, 'users', userData.id);
        await updateDoc(userDocRef, userData);
        toast({ title: "User Updated", description: "User details have been successfully updated." });
      } else { // Adding new user
        const newUser = {
          ...userData,
          avatarUrl: `https://avatar.vercel.sh/${userData.email}.png`,
        }
        await addDoc(collection(db, 'users'), newUser);
        toast({ title: "User Added", description: "New user record created in Firestore." });
      }
      setIsUserDialogOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not save user." });
    }
  };
  
  if (currentUser?.role !== 'management') {
    return null;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline text-primary">User Management</CardTitle>
            <CardDescription>View, add, and edit user roles and details.</CardDescription>
          </div>
          <Button size="sm" onClick={handleAddUser}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add User
          </Button>
        </CardHeader>
        <CardContent>
           {isLoading ? (
            <p className="text-center py-8">Loading users...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarImage src={user.avatarUrl} alt={user.name} />
                          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'management' ? 'default' : 'secondary'} className="capitalize">
                        {user.role === 'management' ? <ShieldCheck className="mr-1 h-3 w-3" /> : <UserIcon className="mr-1 h-3 w-3" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.department || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)} aria-label="Edit user">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      {currentUser?.id !== user.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Delete user">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                               <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="text-warning"/> Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete the user's data record from the application (profile, shifts, etc.). This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                                Delete User Record
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          {!isLoading && users.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No users found.</p>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
             <DialogHeader>
                <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
                <DialogDescription>
                    {editingUser ? "Modify the user's details and role." : "Create a new user record in Firestore."}
                </DialogDescription>
            </DialogHeader>
            <UserFormDialog 
                userData={editingUser} 
                onSave={handleSaveUser}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
