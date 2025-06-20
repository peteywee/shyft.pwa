import AppLayout from '@/components/layout/app-layout';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings - ShYft',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
