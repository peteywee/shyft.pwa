
import type { User } from '@/types';

// Centralized mock user for development when authentication is bypassed.
export const MOCK_MANAGER_USER: User = {
  id: 'dev-manager-01',
  name: 'Dev Manager',
  email: 'dev@example.com',
  role: 'management',
  avatarUrl: 'https://placehold.co/100x100.png',
  phone: '123-456-7890',
  department: 'Operations'
};

export const MOCK_STAFF_USER: User = {
    id: 'dev-staff-01',
    name: 'Dev Staff',
    email: 'staff@example.com',
    role: 'staff',
    avatarUrl: 'https://placehold.co/100x100.png',
    phone: '098-765-4321',
    department: 'Sales'
}
