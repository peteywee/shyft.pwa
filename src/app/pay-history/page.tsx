
'use client';

import React, { useEffect, useState } from 'react';
import { calculatePayForAllUsers, PayDetails } from './_utils/pay-calculator';
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
  const [payDetails, setPayDetails] = useState<PayDetails[]>([]);
  const [filteredPayDetails, setFilteredPayDetails] = useState<PayDetails[]>([]);
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
        const calculatedPay = calculatePayForAllUsers(shifts, usersData);
        setPayDetails(calculatedPay);
        setFilteredPayDetails(calculatedPay);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);
  
  useEffect(() => {
    if (selectedUser === 'all') {
      setFilteredPayDetails(payDetails);
    } else {
      setFilteredPayDetails(payDetails.filter(p => p.userId === selectedUser));
    }
  }, [selectedUser, payDetails]);

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
            Review total hours and estimated pay for each staff member.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
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
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead>Pay Rate</TableHead>
                <TableHead>Estimated Total Pay</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayDetails.map((pay) => (
                <TableRow key={pay.userId}>
                  <TableCell>{pay.userName}</TableCell>
                  <TableCell>{pay.totalHours.toFixed(2)}</TableCell>
                  <TableCell>${pay.payRate.toFixed(2)} / hr</TableCell>
                  <TableCell>${pay.totalPay.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
