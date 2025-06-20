import AppLayout from '@/components/layout/app-layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Profile - ShYft',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
