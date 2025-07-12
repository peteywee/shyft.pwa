
import type { Shift } from '@/types';
import { format, parseISO, startOfWeek } from 'date-fns';

// --- Pay Calculation Constants ---
// This would typically come from a user's profile or a settings collection.
const HOURLY_RATE = 25; // $25/hour
const OVERTIME_MULTIPLIER = 1.5;
const WEEKLY_HOURS_THRESHOLD = 40;
// ---

export interface PayPeriod {
  id: string;
  startDate: string;
  endDate: string;
  totalHours: number;
  regularHours: number;
  overtimeHours: number;
  totalPay: number;
  shifts: Shift[];
}

export const calculatePayPeriods = (shifts: Shift[]): PayPeriod[] => {
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
