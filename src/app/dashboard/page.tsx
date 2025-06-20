'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import type { Shift, User } from '@/types';
import { mockShifts, mockUsers } from '@/lib/mock-data'; // Use actual data source in a real app
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Helper to get staff users
const getStaffUsers = (allUsers: User[]): User[] => {
  return allUsers.filter(user => user.role === 'staff');
};

export default function DashboardPage() {
  const { user, getAllUsers } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [shifts, setShifts] = useState<Shift[]>(mockShifts); // Initialize with mockShifts
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<Partial<Shift> | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setStaffUsers(getStaffUsers(getAllUsers()));
  }, [getAllUsers]);

  const shiftsForSelectedDate = selectedDate
    ? shifts.filter(shift => shift.date === format(selectedDate, 'yyyy-MM-dd'))
    : [];

  const handleAddShift = () => {
    if (!selectedDate) return;
    setCurrentShift({ date: format(selectedDate, 'yyyy-MM-dd') });
    setIsShiftDialogOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setCurrentShift(shift);
    setIsShiftDialogOpen(true);
  };

  const handleDeleteShift = (shiftId: string) => {
    setShifts(prevShifts => prevShifts.filter(s => s.id !== shiftId));
    toast({ title: 'Shift Deleted', description: 'The shift has been removed from the schedule.' });
  };

  const handleSaveShift = (formData: Omit<Shift, 'id' | 'userName'> & { id?: string }) => {
    const staffMember = staffUsers.find(u => u.id === formData.userId);
    if (!staffMember) {
      toast({ variant: 'destructive', title: 'Error', description: 'Selected staff member not found.' });
      return;
    }

    if (formData.id) { // Editing existing shift
      setShifts(prevShifts => prevShifts.map(s => s.id === formData.id ? { ...s, ...formData, userName: staffMember.name } : s));
      toast({ title: 'Shift Updated', description: 'The shift has been successfully updated.' });
    } else { // Adding new shift
      const newShift: Shift = {
        ...formData,
        id: `shift-${Date.now()}`,
        userName: staffMember.name,
      };
      setShifts(prevShifts => [...prevShifts, newShift]);
      toast({ title: 'Shift Added', description: 'The new shift has been added to the schedule.' });
    }
    setIsShiftDialogOpen(false);
    setCurrentShift(null);
  };
  
  const ShiftForm = ({ initialData, onSave }: { initialData: Partial<Shift> | null, onSave: (data: any) => void }) => {
    const [formData, setFormData] = useState({
      id: initialData?.id || undefined,
      userId: initialData?.userId || '',
      date: initialData?.date || (selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''),
      startTime: initialData?.startTime || '09:00',
      endTime: initialData?.endTime || '17:00',
      title: initialData?.title || '',
    });
  
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
          <Button type="button" variant="outline" onClick={() => setIsShiftDialogOpen(false)}>Cancel</Button>
          <Button type="submit">Save Shift</Button>
        </DialogFooter>
      </form>
    );
  };


  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 font-headline text-primary">Staff Schedule</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view or add shifts.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={{ 
                scheduled: shifts.map(shift => parseISO(shift.date))
              }}
              modifiersClassNames={{
                scheduled: 'bg-accent/30 text-accent-foreground rounded-full',
              }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Shifts for {selectedDate ? format(selectedDate, 'PPP') : 'selected date'}
              </CardTitle>
              <CardDescription>Manage staff assignments for this day.</CardDescription>
            </div>
            {user?.role === 'management' && selectedDate && (
              <Button onClick={handleAddShift} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Shift
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {shiftsForSelectedDate.length > 0 ? (
              <ul className="space-y-4">
                {shiftsForSelectedDate.map(shift => (
                  <li key={shift.id} className="p-4 border rounded-lg bg-card hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg text-primary">{shift.userName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {shift.startTime} - {shift.endTime} {shift.title ? `(${shift.title})` : ''}
                        </p>
                      </div>
                      {user?.role === 'management' && (
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditShift(shift)} aria-label="Edit shift">
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteShift(shift.id)} className="text-destructive hover:text-destructive" aria-label="Delete shift">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                {selectedDate ? 'No shifts scheduled for this date.' : 'Please select a date to see shifts.'}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {user?.role === 'management' && (
        <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{currentShift?.id ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
              <DialogDescription>
                {currentShift?.id ? 'Modify the details for this shift.' : 'Assign a staff member to a shift for the selected date.'}
              </DialogDescription>
            </DialogHeader>
            <ShiftForm initialData={currentShift} onSave={handleSaveShift} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
