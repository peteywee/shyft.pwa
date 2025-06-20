import AppLayout from '@/components/layout/app-layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Management - ShYft',
};

export default function UsersLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
