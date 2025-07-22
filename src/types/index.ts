export type Role = 'management' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  payRate?: number; // 👈 This line was added
  avatarUrl?: string;
  phone?: string;
  department?: string;
}

export interface Shift {
  id: string;
  userId: string;
  userName: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  title?: string; // Optional title for the shift
}
