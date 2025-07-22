
import { describe, it, expect } from 'vitest';
import { calculatePayPeriods } from './pay-calculator';
import type { Shift } from '@/types';

describe('pay-calculator', () => {
  it('should calculate pay correctly for a set of shifts', () => {
    const shifts: Shift[] = [
      // Week 1
      { id: 's1', userId: '1', userName: 'Alice', date: '2024-01-01', startTime: '09:00', endTime: '17:00' }, // 8 hours
      { id: 's2', userId: '1', userName: 'Alice', date: '2024-01-02', startTime: '09:00', endTime: '17:00' }, // 8 hours
      { id: 's3', userId: '1', userName: 'Alice', date: '2024-01-03', startTime: '09:00', endTime: '17:00' }, // 8 hours
      { id: 's4', userId: '1', userName: 'Alice', date: '2024-01-04', startTime: '09:00', endTime: '17:00' }, // 8 hours
      { id: 's5', userId: '1', userName: 'Alice', date: '2024-01-05', startTime: '09:00', endTime: '17:00' }, // 8 hours
      // Week 2
      { id: 's6', userId: '1', userName: 'Alice', date: '2024-01-08', startTime: '09:00', endTime: '17:00' }, // 8 hours
      { id: 's7', userId: '1', userName: 'Alice', date: '2024-01-09', startTime: '10:00', endTime: '15:00' }, // 5 hours
    ];

    const result = calculatePayPeriods(shifts);

    expect(result).toHaveLength(2);

    const week1Pay = result.find(p => p.id === '2024-01-01');
    expect(week1Pay?.totalHours).toBe(40);
    expect(week1Pay?.regularHours).toBe(40);
    expect(week1Pay?.overtimeHours).toBe(0);
    expect(week1Pay?.totalPay).toBe(1000);

    const week2Pay = result.find(p => p.id === '2024-01-08');
    expect(week2Pay?.totalHours).toBe(13);
    expect(week2Pay?.regularHours).toBe(13);
    expect(week2Pay?.overtimeHours).toBe(0);
    expect(week2Pay?.totalPay).toBe(325);
  });
});
