
'use client';

import React, { useState, useEffect } from 'react';
import type { Shift, User } from '@/types';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


interface ShiftFormProps {
    initialData: Partial<Shift> | null;
    onSave: (data: any) => void;
    staffUsers: User[];
    closeDialog: () => void;
}

export function ShiftForm({ initialData, onSave, staffUsers, closeDialog }: ShiftFormProps) {
    const { toast } = useToast();
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
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.userId || !formData.date || !formData.startTime || !formData.endTime) {
        toast({ variant: 'destructive', title: 'Missing Fields', description: 'Please fill in all required shift details.' });
        return;
      }
      onSave(formData);
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
          <Button type="submit">Save Shift</Button>
        </DialogFooter>
      </form>
    );
  };
