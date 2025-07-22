
import { describe, it, expect } from 'vitest';
import { calculatePayForAllUsers } from '../pay-calculator';
import type { Shift, User } from '@/types';

describe('pay-calculator', () => {
  it('should calculate pay correctly for multiple users and shifts', () => {
    const users: User[] = [
      { id: '1', name: 'Alice', email: 'alice@example.com', role: 'staff', payRate: 20 },
      { id: '2', name: 'Bob', email: 'bob@example.com', role: 'staff', payRate: 25 },
    ];

    const shifts: Shift[] = [
      { id: 's1', userId: '1', userName: 'Alice', date: '2024-01-01', startTime: '09:00', endTime: '17:00' }, // 8 hours
      { id: 's2', userId: '1', userName: 'Alice', date: '2024-01-02', startTime: '10:00', endTime: '15:00' }, // 5 hours
      { id: 's3', userId: '2', userName: 'Bob', date: '2024-01-01', startTime: '08:00', endTime: '16:00' },   // 8 hours
    ];

    const result = calculatePayForAllUsers(shifts, users);

    expect(result).toHaveLength(2);

    const alicePay = result.find(p => p.userId === '1');
    expect(alicePay?.totalHours).toBe(13);
    expect(alicePay?.totalPay).toBe(260);

    const bobPay = result.find(p => p.userId === '2');
    expect(bobPay?.totalHours).toBe(8);
    expect(bobPay?.totalPay).toBe(200);
  });
});
