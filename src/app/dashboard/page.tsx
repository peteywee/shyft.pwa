
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/hooks/use-auth';
import {
  collection,
  query,
  where,
  onSnapshot,
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

const ShiftForm = dynamic(() => import('./_components/shift-form').then(mod => mod.ShiftForm), {
  loading: () => <p>Loading form...</p>,
  ssr: false
});

export default function DashboardPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [shiftsForDay, setShiftsForDay] = useState<Shift[]>([]);
  const [shiftsForMonth, setShiftsForMonth] = useState<Shift[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<Partial<Shift> | null>(null);

  const scheduledCalendarModifiers = useMemo(() => {
    return {
      scheduled: shiftsForMonth.map(shift => parseISO(shift.date))
    };
  }, [shiftsForMonth]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'staff'));
        const querySnapshot = await getDocs(q);
        const staff = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
        setStaffUsers(staff);
      } catch (e) {
        console.error("Error fetching staff:", e)
        toast({ variant: 'destructive', title: 'Firestore Error', description: 'Could not fetch staff users.' });
      }
    };
    if (user?.role === 'management') {
        fetchStaff();
    }
  }, [toast, user]);

  useEffect(() => {
    if (!selectedDate) return;
    
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const q = query(collection(db, 'shifts'), where('date', '==', formattedDate));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const dailyShiftsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shift));
      setShiftsForDay(dailyShiftsData);
    }, (error) => {
        console.error("Error fetching daily shifts:", error);
        toast({ variant: 'destructive', title: 'Firestore Error', description: 'Could not fetch daily shifts.' });
    });

    return () => unsubscribe();
  }, [selectedDate, toast]);
  
  useEffect(() => {
    if (!selectedDate) return;
    
    const firstDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const lastDayOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

    const q = query(collection(db, 'shifts'), 
      where('date', '>=', format(firstDayOfMonth, 'yyyy-MM-dd')),
      where('date', '<=', format(lastDayOfMonth, 'yyyy-MM-dd'))
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const monthlyShiftsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shift));
      setShiftsForMonth(monthlyShiftsData);
    }, (error) => {
        console.error("Error fetching monthly shifts:", error);
        toast({ variant: 'destructive', title: 'Firestore Error', description: 'Could not fetch shifts for the calendar.' });
    });

    return () => unsubscribe();
  }, [selectedDate, toast]);


  const handleAddShiftClick = () => {
    if (!selectedDate) return;
    setCurrentShift({ date: format(selectedDate, 'yyyy-MM-dd') });
    setIsShiftDialogOpen(true);
  };

  const handleEditShiftClick = (shift: Shift) => {
    setCurrentShift(shift);
    setIsShiftDialogOpen(true);
  };

  const handleDeleteShift = async (shiftId: string) => {
    if (!window.confirm("Are you sure you want to delete this shift?")) return;
    try {
      await deleteDoc(doc(db, 'shifts', shiftId));
      toast({ title: 'Shift Deleted', description: 'The shift has been removed.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not delete shift.' });
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 font-headline text-primary">Staff Schedule</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view shifts.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              modifiers={scheduledCalendarModifiers}
              modifiersClassNames={{ scheduled: 'bg-accent/30 text-accent-foreground rounded-full' }}
            />
          </CardContent>
        </Card>

        <Card className="md:col-span-2 shadow-lg rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Shifts for {selectedDate ? format(selectedDate, 'PPP') : 'selected date'}</CardTitle>
              <CardDescription>Manage staff assignments for this day.</CardDescription>
            </div>
             {user?.role === 'management' && selectedDate && (
              <Button onClick={handleAddShiftClick} size="sm">
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
                        <p className="text-sm text-muted-foreground">{shift.startTime} - {shift.endTime} {shift.title ? `(${shift.title})` : ''}</p>
                      </div>
                      {user?.role === 'management' && (
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditShiftClick(shift)} aria-label="Edit shift"><Edit3 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteShift(shift.id)} className="text-destructive hover:text-destructive" aria-label="Delete shift"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-8">{selectedDate ? 'No shifts scheduled for this date.' : 'Please select a date.'}</p>
            )}
          </CardContent>
        </Card>
      </div>

       <Dialog open={isShiftDialogOpen} onOpenChange={setIsShiftDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{currentShift?.id ? 'Edit Shift' : 'Add New Shift'}</DialogTitle>
              <DialogDescription>{currentShift?.id ? 'Modify the details for this shift.' : 'Assign a staff member to a shift.'}</DialogDescription>
            </DialogHeader>
            <ShiftForm 
              initialData={currentShift} 
              staffUsers={staffUsers} 
              closeDialog={() => setIsShiftDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
    </div>
  );
}
