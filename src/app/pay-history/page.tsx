
'use client';

import React, { useEffect, useState } from 'react';
import { calculatePayPeriods, PayPeriod } from './_utils/pay-calculator';
import type { Shift, User } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PayHistoryPage() {
  const [payPeriods, setPayPeriods] = useState<PayPeriod[]>([]);
  const [filteredPayPeriods, setFilteredPayPeriods] = useState<PayPeriod[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [shiftsRes, usersRes] = await Promise.all([
          fetch('/api/shifts'),
          fetch('/api/users'),
        ]);

        if (!shiftsRes.ok || !usersRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const shifts: Shift[] = await shiftsRes.json();
        const usersData: User[] = await usersRes.json();
        
        setUsers(usersData);
        // NOTE: The pay calculator has been simplified to not be user-specific.
        // This is a placeholder for where you might integrate user-specific pay rates.
        const calculatedPay = calculatePayPeriods(shifts);
        setPayPeriods(calculatedPay);
        setFilteredPayPeriods(calculatedPay);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  useEffect(() => {
    // NOTE: Filtering by user is disabled due to the simplified pay calculator.
    // This is a placeholder for where you might re-enable this functionality.
    if (selectedUser === 'all') {
      setFilteredPayPeriods(payPeriods);
    } else {
      // This will not filter as expected since pay periods are not user-specific.
      setFilteredPayPeriods(payPeriods);
    }
  }, [selectedUser, payPeriods]);

  if (isLoading) {
    return <div className="container mx-auto py-8">Loading pay history...</div>;
  }

  if (error) {
    return <div className="container mx-auto py-8 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Pay History</CardTitle>
          <CardDescription>
            Review total hours and estimated pay for each pay period.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* NOTE: User filter is currently disabled. */}
          {/* <div className="mb-4">
             <Select onValueChange={setSelectedUser} value={selectedUser}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(user => (
                  <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pay Period</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Regular Hours</TableHead>
                <TableHead>Overtime Hours</TableHead>
                <TableHead>Estimated Total Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayPeriods.map((period) => (
                <TableRow key={period.id}>
                  <TableCell>{period.startDate} - {period.endDate}</TableCell>
                  <TableCell>{period.totalHours.toFixed(2)}</TableCell>
                  <TableCell>{period.regularHours.toFixed(2)}</TableCell>
                  <TableCell>{period.overtimeHours.toFixed(2)}</TableCell>
                  <TableCell>${period.totalPay.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
