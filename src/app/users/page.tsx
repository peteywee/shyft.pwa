'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit3, Trash2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User, Role } from '@/types';
import { useToast } from '@/hooks/use-toast';
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

export default function UsersPage() {
  const { user: currentUser, getAllUsers, updateUserInContext, deleteUserInContext, addUserInContext } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    if (currentUser?.role !== 'management') {
      router.replace('/dashboard');
      toast({ variant: 'destructive', title: 'Access Denied', description: 'You do not have permission to view this page.' });
    } else {
      setUsers(getAllUsers());
    }
  }, [currentUser, router, getAllUsers, toast]);
  
  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserDialogOpen(true);
  };

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setIsUserDialogOpen(true);
  };

  const handleDeleteUser = (userId: string) => {
    try {
      deleteUserInContext(userId);
      setUsers(getAllUsers()); // Refresh users list
      toast({ title: "User Deleted", description: "The user account has been successfully deleted." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  const handleSaveUser = (userData: User) => {
    try {
      if (editingUser) { // Editing existing user
        updateUserInContext(userData);
        toast({ title: "User Updated", description: "User details have been successfully updated." });
      } else { // Adding new user
        addUserInContext({ ...userData, id: `user-${Date.now()}`}); // Ensure new user has an ID
        toast({ title: "User Added", description: "New user account has been successfully created." });
      }
      setUsers(getAllUsers()); // Refresh users list
      setIsUserDialogOpen(false);
      setEditingUser(null);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };
  
  if (currentUser?.role !== 'management') {
    return null; // Or a loading/access denied component
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl rounded-xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-headline text-primary">User Management</CardTitle>
            <CardDescription>View, add, edit, or delete user accounts.</CardDescription>
          </div>
          <Button onClick={handleAddUser} size="sm">
            <PlusCircle className="mr-2 h-4 w-4" /> Add User
          </Button>
        </CardHeader>
        <CardContent>
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
                        <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="profile avatar small" />
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
                    {currentUser?.id !== user.id && ( // Prevent manager from deleting self via this UI
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label="Delete user">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete the user account for {user.name}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                              Delete
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
          {users.length === 0 && (
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

interface UserFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  userData: User | null; // Pass null for new user, User object for editing
  onSave: (userData: User) => void;
}

function UserFormDialog({ isOpen, onOpenChange, userData, onSave }: UserFormDialogProps) {
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    if (userData) {
      setFormData(userData);
    } else { // Reset for new user
      setFormData({ name: '', email: '', role: 'staff', department: '', phone: '' });
    }
  }, [userData, isOpen]); // Reset form when dialog opens or userData changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (value: string, fieldName: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value as Role }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic validation
    if (!formData.name || !formData.email || !formData.role) {
      // Handle error display, e.g., using toast
      alert("Please fill in all required fields: Name, Email, Role.");
      return;
    }
    onSave(formData as User); // Assume all fields are now present or correctly defaulted
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{userData ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {userData ? 'Modify the details for this user.' : 'Create a new user account.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} required disabled={!!userData} />
             {!!userData && <p className="text-xs text-muted-foreground mt-1">Email cannot be changed for existing users.</p>}
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
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save User</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

