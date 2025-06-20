'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, FileText } from 'lucide-react';

export default function PayHistoryPage() {
  // Mock data for pay history items
  const payHistoryItems = [
    { id: 'pay1', date: '2024-07-15', amount: '$2,500.00', period: 'July 1-15, 2024', status: 'Paid' },
    { id: 'pay2', date: '2024-06-30', amount: '$2,450.75', period: 'June 16-30, 2024', status: 'Paid' },
    { id: 'pay3', date: '2024-06-15', amount: '$2,510.50', period: 'June 1-15, 2024', status: 'Paid' },
  ];

  return (
    <div className="container mx-auto py-8">
      <Card className="shadow-xl rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-headline text-primary">Pay History</CardTitle>
          <CardDescription>Review your past payment records.</CardDescription>
        </CardHeader>
        <CardContent>
          {payHistoryItems.length > 0 ? (
            <div className="space-y-6">
              {payHistoryItems.map((item) => (
                <div key={item.id} className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                    <div className="mb-4 sm:mb-0">
                      <h3 className="font-semibold text-lg text-primary flex items-center">
                        <DollarSign className="mr-2 h-5 w-5" /> Payment on {item.date}
                      </h3>
                      <p className="text-sm text-muted-foreground">Pay Period: {item.period}</p>
                    </div>
                    <div className="text-left sm:text-right">
                       <p className="text-xl font-bold text-foreground">{item.amount}</p>
                       <p className={`text-sm font-medium ${item.status === 'Paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                         Status: {item.status}
                       </p>
                    </div>
                  </div>
                   <div className="mt-4 pt-4 border-t border-border/50 flex justify-end">
                      <button className="text-sm text-primary hover:underline flex items-center">
                        <FileText className="mr-1 h-4 w-4" /> View Details
                      </button>
                    </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <DollarSign className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-xl font-medium text-muted-foreground">No Pay History Available</p>
              <p className="text-sm text-muted-foreground">Your payment records will appear here once available.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
