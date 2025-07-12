'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/db';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import type { Shift } from '@/types';
import { format, getDay, getISODay, parseISO, startOfWeek } from 'date-fns';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// --- Pay Calculation Constants ---
// This would typically come from a user's profile or a settings collection.
const HOURLY_RATE = 25; // $25/hour
const OVERTIME_MULTIPLIER = 1.5;
const WEEKLY_HOURS_THRESHOLD = 40;
// ---

interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  totalPay: number;
  shifts: Shift[];
}

export default function PayHistoryPage() {
  const { user } = useAuth();
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchShiftsAndCalculatePay = async () => {
      setIsLoading(true);
      
      const shiftsQuery = query(
        collection(db, 'shifts'), 
        where('userId', '==', user.id),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(shiftsQuery);
      const userShifts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Shift));

      const periods = calculatePayPeriods(userShifts);
      setPayPeriods(periods);
      setIsLoading(false);
    };

    fetchShiftsAndCalculatePay();
  }, [user]);
  
  const calculatePayPeriods = (shifts: Shift[]): PayPeriod[] => {
    const groupedByWeek: { [weekStart: string]: Shift[] } = {};

    shifts.forEach(shift => {
      const shiftDate = parseISO(shift.date);
      // Use Monday as the start of the week
      const weekStartDate = startOfWeek(shiftDate, { weekStartsOn: 1 });
      const weekStartString = format(weekStartDate, 'yyyy-MM-dd');
      
      if (!groupedByWeek[weekStartString]) {
        groupedByWeek[weekStartString] = [];
      }
      groupedByWeek[weekStartString].push(shift);
    });

    const calculatedPeriods: PayPeriod[] = Object.entries(groupedByWeek).map(([weekStart, weeklyShifts]) => {
      let totalHours = 0;
      weeklyShifts.forEach(shift => {
        const start = parseISO(`${shift.date}T${shift.startTime}`);
        const end = parseISO(`${shift.date}T${shift.endTime}`);
        const duration = (end.getTime() - start.getTime()) / (1000 * 60 * 60); // duration in hours
        totalHours += duration;
      });

      const regularHours = Math.min(totalHours, WEEKLY_HOURS_THRESHOLD);
      const overtimeHours = Math.max(0, totalHours - WEEKLY_HOURS_THRESHOLD);

      const regularPay = regularHours * HOURLY_RATE;
      const overtimePay = overtimeHours * HOURLY_RATE * OVERTIME_MULTIPLIER;
      const totalPay = regularPay + overtimePay;

      const weekEndDate = new Date(weekStart);
      weekEndDate.setDate(weekEndDate.getDate() + 6);

      return {
        id: weekStart,
        startDate: format(parseISO(weekStart), 'MMM d, yyyy'),
        endDate: format(weekEndDate, 'MMM d, yyyy'),
        totalHours: parseFloat(totalHours.toFixed(2)),
        regularHours: parseFloat(regularHours.toFixed(2)),
        overtimeHours: parseFloat(overtimeHours.toFixed(2)),
        totalPay: parseFloat(totalPay.toFixed(2)),
        shifts: weeklyShifts,
      };
    });

    return calculatedPeriods;
  };

  if (isLoading) {
    return <PayHistorySkeleton />;
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Pay History</CardTitle>
          <CardDescription>Review your past weekly pay summaries based on your shifts.</CardDescription>
        </CardHeader>
        <CardContent>
          {payPeriods.length > 0 ? (
            <div className="space-y-6">
              {payPeriods.map((item) => (
                <div key={item.id} className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="font-semibold text-lg text-primary flex items-center">
                        <DollarSign className="mr-2 h-5 w-5" /> Pay for Week of {item.startDate}
                      </h3>
                      <p className="text-sm text-muted-foreground">Pay Period: {item.startDate} - {item.endDate}</p>
                       <p className="text-sm text-muted-foreground">
                          {item.totalHours} hours ({item.regularHours} regular + {item.overtimeHours} OT)
                       </p>
                    </div>
                    <div className="text-left sm:text-right">
                       <p className="text-xl font-bold text-foreground">${item.totalPay.toFixed(2)}</p>
                       <p className='text-sm font-medium text-green-600'>Status: Calculated</p>
                    </div>
                  </div>
                   <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
                      <button className="text-sm text-primary hover:underline flex items-center opacity-50 cursor-not-allowed">
                        <FileText className="mr-1 h-4 w-4" /> View Details (coming soon)
                      </button>
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-medium text-muted-foreground">No Pay History Available</p>
              <p className="text-sm text-muted-foreground">Your calculated pay will appear here once you have recorded shifts.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function PayHistorySkeleton() {
  return (
     <div className="container mx-auto py-8">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-4 w-3/4 mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-6 border rounded-lg">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-4 sm:mb-0 w-full sm:w-1/2">
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <Skeleton className="h-8 w-24 ml-auto" />
                  <Skeleton className="h-4 w-20 mt-2 ml-auto" />
                </div>
              </div>
               <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
                  <Skeleton className="h-5 w-32" />
                </div>
          </div>
           <div className="p-6 border rounded-lg">
             <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div className="mb-4 sm:mb-0 w-full sm:w-1/2">
                  <Skeleton className="h-7 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-2" />
                  <Skeleton className="h-4 w-2/3 mt-2" />
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <Skeleton className="h-8 w-24 ml-auto" />
                  <Skeleton className="h-4 w-20 mt-2 ml-auto" />
                </div>
              </div>
               <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
                  <Skeleton className="h-5 w-32" />
                </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
