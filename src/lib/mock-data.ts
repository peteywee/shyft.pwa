import type { User, Shift, Role } from '@/types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'manager@shyft.com',
    name: 'Alex Manager',
    role: 'management',
    avatarUrl: 'https://placehold.co/100x100.png',
    phone: '555-0101',
    department: 'Operations',
  },
  {
    id: 'user-2',
    email: 'staff1@shyft.com',
    name: 'Jamie Staff',
    role: 'staff',
    avatarUrl: 'https://placehold.co/100x100.png',
    phone: '555-0102',
    department: 'Frontline',
  },
  {
    id: 'user-3',
    email: 'staff2@shyft.com',
    name: 'Casey Staff',
    role: 'staff',
    avatarUrl: 'https://placehold.co/100x100.png',
    phone: '555-0103',
    department: 'Support',
  },
];

export const mockShifts: Shift[] = [
  {
    id: 'shift-1',
    userId: 'user-2',
    userName: 'Jamie Staff',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], // Tomorrow
    startTime: '09:00',
    endTime: '17:00',
    title: 'Morning Shift',
  },
  {
    id: 'shift-2',
    userId: 'user-3',
    userName: 'Casey Staff',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0], // Tomorrow
    startTime: '14:00',
    endTime: '22:00',
    title: 'Evening Shift',
  },
  {
    id: 'shift-3',
    userId: 'user-2',
    userName: 'Jamie Staff',
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString().split('T')[0], // 3 days from now
    startTime: '09:00',
    endTime: '17:00',
    title: 'Weekend Cover',
  },
];
