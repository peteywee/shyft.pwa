import Link from 'next/link';
import { Briefcase } from 'lucide-react'; // Using Briefcase as a generic business/work icon

export function Logo({ collapsed }: { collapsed?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="text-primary hover:text-primary/90 transition-colors duration-200"
      legacyBehavior>
      <div className="flex items-center gap-2">
        <Briefcase className={`h-8 w-8 ${collapsed ? 'mx-auto' : ''}`} strokeWidth={1.5} />
        {!collapsed && <span className="text-2xl font-bold font-headline">ShYft</span>}
      </div>
    </Link>
  );
}
