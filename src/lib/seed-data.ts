
import type { Shift } from '@/types';
import { format, subDays } from 'date-fns';

const today = new Date();

export const SEED_SHIFTS: Shift[] = [
  // Last Week's Shifts
  {
    id: 'shift1',
    userId: 'dev-staff-01',
    userName: 'Dev Staff',
    date: format(subDays(today, 8), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    title: 'Morning Shift',
  },
  {
    id: 'shift2',
    userId: 'dev-staff-01',
    userName: 'Dev Staff',
    date: format(subDays(today, 7), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    title: 'Morning Shift',
  },
  {
    id: 'shift3',
    userId: 'dev-staff-01',
    userName: 'Dev Staff',
    date: format(subDays(today, 6), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    title: 'Morning Shift',
  },
  {
    id: 'shift4',
    userId: 'dev-staff-01',
    userName: 'Dev Staff',
    date: format(subDays(today, 5), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '17:00',
    title: 'Morning Shift',
  },
  {
    id: 'shift5',
    userId: 'dev-staff-01',
    userName: 'Dev Staff',
    date: format(subDays(today, 4), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '18:00', // 9 hours for overtime demo
    title: 'Long Shift',
  },
  // This Week's Shifts
    {
    id: 'shift6',
    userId: 'dev-staff-01',
    userName: 'Dev Staff',
    date: format(subDays(today, 1), 'yyyy-MM-dd'),
    startTime: '13:00',
    endTime: '21:00',
    title: 'Closing Shift',
  },
  {
    id: 'shift7',
    userId: 'dev-manager-01',
    userName: 'Dev Manager',
    date: format(subDays(today, 1), 'yyyy-MM-dd'),
    startTime: '08:00',
    endTime: '16:00',
    title: 'Admin Shift',
  },
];
