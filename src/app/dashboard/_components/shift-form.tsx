
'use client';

import React, { useState, useEffect } from 'react';
import type { Shift, User } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ShiftFormProps {
    initialData: Partial<Shift> | null;
    staffUsers: User[];
    closeDialog: () => void;
}

export function ShiftForm({ initialData, staffUsers, closeDialog }: ShiftFormProps) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
      id: initialData?.id || undefined,
      userId: initialData?.userId || '',
      date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
      startTime: initialData?.startTime || '09:00',
      endTime: initialData?.endTime || '17:00',
      title: initialData?.title || '',
    });

    useEffect(() => {
        setFormData({
            id: initialData?.id || undefined,
            userId: initialData?.userId || '',
            date: initialData?.date || format(new Date(), 'yyyy-MM-dd'),
            startTime: initialData?.startTime || '09:00',
            endTime: initialData?.endTime || '17:00',
            title: initialData?.title || '',
        });
    }, [initialData]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
  
    const handleSelectChange = (value: string, fieldName: string) => {
      setFormData(prev => ({ ...prev, [fieldName]: value }));
    };
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.userId || !formData.date || !formData.startTime || !formData.endTime) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill in all required shift details.' });
        return;
      }
      
      setIsSaving(true);
      
      try {
        const idToken = await user?.getIdToken();
        if (!idToken) {
          throw new Error("Authentication token not available.");
        }

        const response = await fetch('/api/shifts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          // If the background sync is working, this might not be reached when offline,
          // but it's good for handling immediate server errors when online.
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save shift.');
        }

        toast({
          title: 'Shift Saved!',
          description: 'Your changes have been saved. They will sync if you are offline.',
        });
        closeDialog();

      } catch (error) {
        console.error("Failed to save shift:", error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error instanceof Error ? error.message : 'Could not save shift. Your changes will be synced when you are back online.',
        });
        // We still close the dialog optimistically, as background sync will handle it.
        closeDialog();
      } finally {
        setIsSaving(false);
      }
    };
  
    return (
       <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="userId">Staff Member</Label>
          <Select name="userId" value={formData.userId} onValueChange={(value) => handleSelectChange(value, 'userId')} required>
            <SelectTrigger id="userId">
              <SelectValue placeholder="Select staff" />
            </SelectTrigger>
            <SelectContent>
              {staffUsers.map(staff => (
                <SelectItem key={staff.id} value={staff.id}>{staff.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="startTime">Start Time</Label>
          <Input id="startTime" name="startTime" type="time" value={formData.startTime} onChange={handleChange} required />
        </div>
        <div>
          <Label htmlFor="endTime">End Time</Label>
          <Input id="endTime" name="endTime" type="time" value={formData.endTime} onChange={handleChange} required />
        </div>
         <div>
          <Label htmlFor="title">Shift Title (Optional)</Label>
          <Input id="title" name="title" type="text" placeholder="e.g., Opening Shift" value={formData.title} onChange={handleChange} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={closeDialog}>Cancel</Button>
          <Button type="submit" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Shift'}</Button>
        </DialogFooter>
      </form>
    );
  };
