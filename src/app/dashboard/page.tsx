<<<<<<< HEAD

'use client';

import React, { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Shift, User } from '@/types';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ShiftForm } from './_components/shift-form';
import { MOCK_USER } from '@/lib/mock-user';

export default function DashboardPage() {
  const user = MOCK_USER; 
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [shiftsForDay, setShiftsForDay] = useState<Shift[]>([]);
  const [shiftsForMonth, setShiftsForMonth] = useState<Shift[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<Partial<Shift> | null>(null);
  
  // Fetch staff users from Firestore (only once)
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'staff'));
        const querySnapshot = await getDocs(q);
        const staff = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setStaffUsers(staff);
      } catch (e) {
        console.error("Error fetching staff. Is your .env file configured correctly?", e)
        toast({ variant: 'destructive', title: 'Firestore Error', description: 'Could not fetch staff users. Check your Firebase connection.' });
      }
    };
    fetchStaff();
  }, [toast]);

  // Subscribe to shifts for the selected DAY
  useEffect(() => {
    if (!selectedDate) return;
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const q = query(collection(db, 'shifts'), where('date', '==', formattedDate));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dailyShiftsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Shift));
      setShiftsForDay(dailyShiftsData);
    }, (error) => {
        console.error("Error fetching daily shifts:", error);
        toast({ variant: 'destructive', title: 'Firestore Error', description: 'Could not fetch daily shifts.' });
    });

    return () => unsubscribe();
  }, [selectedDate, toast]);
  
  // Subscribe to shifts for the selected MONTH (for calendar highlighting)
  useEffect(() => {
    if (!selectedDate) return;
    
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

    const q = query(collection(db, 'shifts'), 
      where('date', '>=', format(firstDayOfMonth, 'yyyy-MM-dd')),
      where('date', '<=', format(lastDayOfMonth, 'yyyy-MM-dd'))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const monthlyShiftsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Shift));
      setShiftsForMonth(monthlyShiftsData);
    }, (error) => {
        console.error("Error fetching monthly shifts:", error);
        toast({ variant: 'destructive', title: 'Firestore Error', description: 'Could not fetch shifts for the calendar.' });
    });

    return () => unsubscribe();
  }, [selectedDate, toast]);


  const handleAddShift = () => {
    if (!selectedDate) return;
    setCurrentShift({ date: format(selectedDate, 'yyyy-MM-dd') });
    setIsShiftDialogOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setCurrentShift(shift);
    setIsShiftDialogOpen(true);
  };

  const handleDeleteShift = async (shiftId: string) => {
    try {
      await deleteDoc(doc(db, 'shifts', shiftId));
      toast({ title: 'Shift Deleted', description: 'The shift has been removed.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete shift.' });
    }
  };

  const handleSaveShift = async (formData: Omit<Shift, 'id' | 'userName'> & { id?: string }) => {
    const staffMember = staffUsers.find(u => u.id === formData.userId);
    if (!staffMember) {
      toast({ variant: 'destructive', title: 'Error', description: 'Selected staff member not found.' });
      return;
    }

    const shiftData = { ...formData, userName: staffMember.name };

    try {
      if (shiftData.id) { // Editing
        const shiftDocRef = doc(db, 'shifts', shiftData.id);
        await updateDoc(shiftDocRef, shiftData);
        toast({ title: 'Shift Updated', description: 'The shift has been successfully updated.' });
      } else { // Adding
        await addDoc(collection(db, 'shifts'), shiftData);
        toast({ title: 'Shift Added', description: 'The new shift has been added.' });
      }
      setIsShiftDialogOpen(false);
      setCurrentShift(null);
    } catch (error) {
       toast({ variant: 'destructive', title: 'Error', description: 'Could not save shift.' });
    }
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
                scheduled: shiftsForMonth.map(shift => parseISO(shift.date))
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
            {shiftsForDay.length > 0 ? (
              <ul className="space-y-4">
                {shiftsForDay.map(shift => (
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
            <ShiftForm 
              initialData={currentShift} 
              onSave={handleSaveShift} 
              staffUsers={staffUsers} 
              closeDialog={() => setIsShiftDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
=======
export const dynamic = 'force-dynamic';

'use client';

import React, { useState, useEffect, useCallback } from 'react';
// ... rest of the file
>>>>>>> cd9f8f19f7821f90b84de55171d082541fb5f421
