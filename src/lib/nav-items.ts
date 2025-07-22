
import { Home, CalendarClock, Users2, Settings, CreditCard, User } from 'lucide-react'

export type NavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  role?: 'management' | 'staff'
}

export const navItems: NavItem[] = [
    { href: '/dashboard', icon: Home, label: 'Dashboard' },
    { href: '/users', icon: Users2, label: 'Users', role: 'management' },
    { href: '/pay-history', icon: CreditCard, label: 'Pay History' },
    { href: '/profile', icon: User, label: 'Profile' },
    { href: '/settings', icon: Settings, label: 'Settings' },
]
