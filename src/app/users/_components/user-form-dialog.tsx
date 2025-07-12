
'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { User, Role } from '@/types';


interface UserFormDialogProps {
  userData: User | null;
  onSave: (userData: Partial<User>) => Promise<void>;
}

export function UserFormDialog({ userData, onSave }: UserFormDialogProps) {
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // If userData is provided, we're editing. Otherwise, we're adding.
    setFormData(userData || { name: '', email: '', role: 'staff', department: '', phone: '' });
  }, [userData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (value: string, fieldName: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value as Role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
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
        {userData && <p className="text-xs text-muted-foreground mt-1">Email cannot be changed.</p>}
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
            <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
        </DialogFooter>
    </form>
  );
}
