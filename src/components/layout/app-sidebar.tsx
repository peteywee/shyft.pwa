
'use client'

import Link from "next/link"
import {
  Bell,
  Calendar,
  CircleUser,
  Home,
  LineChart,
  Menu,
  Package,
  Package2,
  Search,
  ShoppingCart,
  Users,
  CreditCard,
  Settings,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import Logo from "../logo"

const navItems = [
    { href: "/dashboard", icon: Calendar, label: "Schedule" },
    { href: "/users", icon: Users, label: "Users", role: 'management' },
    { href: "/pay-history", icon: CreditCard, label: "Pay History" },
    { href: "/profile", icon: CircleUser, label: "Profile" },
    { href: "/settings", icon: Settings, label: "Settings" },
]

export function AppSidebar() {
    return (
        <div className="hidden border-r bg-card md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Logo />
                        <span className="">Shyft</span>
                    </Link>
                </div>
                <div className="flex-1">
                   <AppSidebarNav />
                </div>
            </div>
        </div>
    )
}

export function AppSidebarNav({ isMobile = false }) {
    const pathname = usePathname();
    const { user } = useAuth();
    
    const filteredNavItems = navItems.filter(item => {
        if (item.role) {
            return user?.role === item.role;
        }
        return true;
    });

    return (
        <nav className={cn("grid items-start px-2 text-sm font-medium lg:px-4", isMobile && "mt-8")}>
            {filteredNavItems.map(({ href, icon: Icon, label }) => (
                <Link
                    key={href}
                    href={href}
                    className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                        pathname === href && "bg-muted text-primary"
                    )}
                >
                    <Icon className="h-4 w-4" />
                    {label}
                </Link>
            ))}
        </nav>
    )
}
