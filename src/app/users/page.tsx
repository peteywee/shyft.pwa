'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/db';
import { 
  collection, 
  onSnapshot, 
  doc, 
  updateDoc, 
  deleteDoc,
  // Note: Adding a new user with email/password requires Firebase Admin SDK (backend)
  // or a more complex flow. We will disable adding new users from this page for now.
} from 'firebase/firestore';

import type { User, Role } from '@/types';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit3, Trash2, ShieldCheck, User as UserIcon, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';


export default function UsersPage() {
  const { user: currentUser } = useAuth();
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
      return; // Stop further execution
    }

    const unsubscribe = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
      setUsers(usersData);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching users:", error);
      toast({ variant: "destructive", title: "Error", description: "Could not fetch users." });
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup on unmount
  }, [currentUser, router, toast]);
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };
  
  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = async (userId: string) => {
    // Deleting a user in Firestore does NOT delete their auth entry.
    // This requires a Cloud Function for a complete solution.
    // For now, we just delete the Firestore record.
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast({ title: "User Record Deleted", description: "The user's data has been removed. Their authentication entry still exists." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete user record." });
    }
  };

  const handleSaveUser = async (userData: User) => {
    if (!editingUser) return; // Should not happen with current UI flow
    
    try {
      const userDocRef = doc(db, 'users', editingUser.id);
      await updateDoc(userDocRef, userData);
      toast({ title: "User Updated", description: "User details have been successfully updated." });
      setIsUserDialogOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Could not update user." });
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
            <CardDescription>View and edit user roles and details.</CardDescription>
          </div>
           <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" disabled>
                  <PlusCircle className="mr-2 h-4 w-4" /> Add User
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New users must register themselves through the public registration page.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                                This action only deletes the user's data record from the application (profile, shifts, etc.). It does NOT delete their login credentials. For full deletion, you must remove the user from the Firebase Authentication console.
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
            </Table>>
          )}
          {!isLoading && users.length === 0 && (
            <p className="text-center text-muted-foreground py-8">No users found.</p>
          )}
        </CardContent>
      </Card>

      <UserFormDialog 
        isOpen={isUserDialogOpen} 
        onOpenChange={setIsUserDialogOpen} 
        userData={editingUser} 
        onSave={handleSaveUser}
      />
    </div>
  );
}

// UserFormDialog component remains largely the same but the onSave prop is now async
interface UserFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  userData: User | null;
  onSave: (userData: User) => Promise<void>;
}

function UserFormDialog({ isOpen, onOpenChange, userData, onSave }: UserFormDialogProps) {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData(userData);
    }
  }, [userData, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (value: string, fieldName: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value as Role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData as User);
    setIsSaving(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Modify the user's details and role.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email || ''} disabled />
            <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>
          </div>
          <div>
            <Label htmlFor="phone">Phone (Optional)</Label>
            <Input id="phone" name="phone" type="tel" value={formData.phone || ''} onChange={handleChange} />
          </div>
           <div>
            <Label htmlFor="department">Department (Optional)</Label>
            <Input id="department" name="department" value={formData.department || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="role">Role</Label>
            <Select name="role" value={formData.role || 'staff'} onValueChange={(value) => handleSelectChange(value, 'role')} required>
              <SelectTrigger id="role">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="management">Management</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
