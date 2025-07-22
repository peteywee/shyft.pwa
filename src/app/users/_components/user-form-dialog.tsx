
'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { User } from '@/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['staff', 'management']),
  payRate: z.preprocess(
    (val) => Number(val),
    z.number().min(0, 'Pay rate must be a positive number')
  ),
});

interface UserFormDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user?: Partial<User>;
  onSave: (user: Partial<User>) => void;
}

export function UserFormDialog({
  isOpen,
  onOpenChange,
  user,
  onSave,
}: UserFormDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      ...user,
      payRate: user?.payRate || 0,
    },
  });
  
  useEffect(() => {
    reset({
      ...user,
      payRate: user?.payRate || 0,
    });
  }, [user, reset]);
  
  const onSubmit = (data: z.infer<typeof userSchema>) => {
    onSave({ ...user, ...data });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{user?.id ? 'Edit User' : 'Add User'}</DialogTitle>
          <DialogDescription>
            {user?.id ? "Make changes to the user's profile." : "Add a new user to the system."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...register('email')} />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <select {...register('role')} className="w-full p-2 border rounded-md">
                  <option value="staff">Staff</option>
                  <option value="management">Management</option>
              </select>
              {errors.role && <p className="text-red-500 text-sm">{errors.role.message}</p>}
            </div>
             <div className="grid gap-2">
              <Label htmlFor="payRate">Pay Rate ($/hour)</Label>
              <Input id="payRate" type="number" step="0.01" {...register('payRate')} />
              {errors.payRate && <p className="text-red-500 text-sm">{errors.payRate.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
