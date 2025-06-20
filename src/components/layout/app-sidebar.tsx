'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarDays,
  Users,
  CreditCard,
  UserCircle,
  Settings,
  LogOut,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarSeparator,
  useSidebar
} from '@/components/ui/sidebar'; // Using the shadcn sidebar

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles?: ('management' | 'staff')[];
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: CalendarDays },
  { href: '/users', label: 'Users', icon: Users, roles: ['management'] },
  { href: '/pay-history', label: 'Pay History', icon: CreditCard },
  { href: '/profile', label: 'Profile', icon: UserCircle },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { state: sidebarState } = useSidebar(); // Get sidebar state (expanded/collapsed)
  const isCollapsed = sidebarState === 'collapsed';

  const userCanView = (item: NavItem) => {
    if (!item.roles) return true;
    if (!user) return false;
    return item.roles.includes(user.role);
  };

  return (
    <Sidebar collapsible="icon" side="left" variant="sidebar">
      <SidebarHeader className={cn("p-4", isCollapsed ? 'justify-center' : '')}>
        <Logo collapsed={isCollapsed}/>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent className="flex-grow">
        <SidebarMenu className="p-2 space-y-1">
          {navItems.filter(userCanView).map((item) => (
            <SidebarMenuItem key={item.label}>
              <Link href={item.href} legacyBehavior passHref>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))}
                  tooltip={isCollapsed ? item.label : undefined}
                  className="w-full justify-start"
                  aria-current={pathname === item.href ? 'page' : undefined}
                >
                  <item.icon className={cn("h-5 w-5", isCollapsed ? 'mx-auto' : 'mr-3')} />
                  <span className={cn(isCollapsed ? 'sr-only' : '')}>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarSeparator />
      <SidebarFooter className="p-2">
        <SidebarMenuButton 
          onClick={logout} 
          tooltip={isCollapsed ? "Log out" : undefined}
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive focus:bg-destructive/10 focus:text-destructive"
        >
          <LogOut className={cn("h-5 w-5", isCollapsed ? 'mx-auto' : 'mr-3')} />
          <span className={cn(isCollapsed ? 'sr-only' : '')}>Log out</span>
        </SidebarMenuButton>
      </SidebarFooter>
    </Sidebar>
  );
}
