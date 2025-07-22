
import { ShieldCheck, CalendarClock, Users, PieChart, Settings } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

export const navItems: NavItem[] = [
  {
    href: '/dashboard',
    label: 'Dashboard',
    icon: <PieChart className="h-5 w-5" />,
  },
  {
    href: '/shifts',
    label: 'Shifts',
    icon: <CalendarClock className="h-5 w-5" />,
  },
  {
    href: '/users',
    label: 'Users',
    icon: <Users className="h-5 w-5" />,
  },
  {
    href: '/pay-history',
    label: 'Pay History',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    href: '/settings',
    label: 'Settings',
    icon: <Settings className="h-5 w-5" />,
  },
];
