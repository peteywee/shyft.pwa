
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User, Role } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface UserFormProps {
  userData?: User | null;
  onSave: (userData: Partial<User>) => Promise<void>;
  closeDialog: () => void;
}

export function UserFormDialog({ userData, onSave, closeDialog }: UserFormProps) {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // If userData is provided, we're editing. Otherwise, we're adding.
    setFormData(userData || { name: '', email: '', role: 'staff' });
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value as Role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill out all required fields.'});
        return;
    }
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
    closeDialog();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} disabled={!!userData} required />
          {userData && <p className="text-xs text-muted-foreground mt-1">Email cannot be changed for existing users.</p>}
        </div>
        <div>
          <Label htmlFor="role">Role</Label>
          <Select name="role" value={formData.role || 'staff'} onValueChange={handleSelectChange} required>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="staff">Staff</SelectItem>
              <SelectItem value="management">Management</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="ghost" onClick={closeDialog}>Cancel</Button>
            <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </div>
    </form>
  );
}
