import AppLayout from '@/components/layout/app-layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - ShYft',
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
