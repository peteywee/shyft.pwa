
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '@/components/logo';
import { navItems } from '@/lib/nav-items.tsx';

export function AppSidebar() {
    return (
        <div className="hidden border-r bg-card md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 font-semibold"
                    >
                        <Logo />
                        <span className="">Shyft</span>
                    </Link>
                </div>
                <div className="flex-1">
                   <AppSidebarNav />
                </div>
            </div>
        </div>
    );
}

export function AppSidebarNav({ isMobile = false }) {
    const pathname = usePathname();
    const { user } = useAuth();
    
    return (
        <nav className={cn("grid items-start px-2 text-sm font-medium lg:px-4", isMobile && "mt-8")}>
            {navItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        pathname === item.href && "bg-muted text-primary"
                    )}
                >
                    {item.icon}
                    {item.label}
                </Link>
            ))}
        </nav>
    );
}
