
'use client';

import React, { useState, useEffect } from 'react';
import type { Shift } from '@/types';
import { MOCK_STAFF_USER } from '@/lib/mock-user';
import { SEED_SHIFTS } from '@/lib/seed-data'; 

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { calculatePayPeriods, type PayPeriod } from './_utils/pay-calculator';

export default function PayHistoryPage() {
  const user = MOCK_STAFF_USER; 
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // We are now using static seed data instead of fetching from Firestore
    // to improve performance and provide a consistent demo experience.
    if (!user) return;

    setIsLoading(true);
    const userShifts = SEED_SHIFTS.filter(shift => shift.userId === user.id);
    const periods = calculatePayPeriods(userShifts);
    setPayPeriods(periods);
    setIsLoading(false);

  }, [user]);
  

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
