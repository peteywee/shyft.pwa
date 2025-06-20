import AppLayout from '@/components/layout/app-layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pay History - ShYft',
};

export default function PayHistoryLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
