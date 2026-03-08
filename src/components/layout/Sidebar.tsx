"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Users, ShoppingCart, PackageSearch, 
  Warehouse, Receipt, TrendingUp, BarChart4, ShieldCheck,
  MapPin
} from "lucide-react";
import { useSession } from "next-auth/react";

const NAV_LINKS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Today's Route", href: "/route", icon: MapPin },
  { name: "Customers", href: "/customers", icon: Users },
  { name: "All Orders", href: "/orders", icon: ShoppingCart },
  { name: "Inventory", href: "/inventory", icon: Warehouse },
  { name: "Receivables", href: "/receivables", icon: Receipt },
  { name: "Finance", href: "/finance", icon: TrendingUp },
  { name: "Reports", href: "/reports", icon: BarChart4 },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === "Admin";

  return (
    <nav className={cn("hidden md:flex flex-col w-64 border-r bg-muted/40 h-full", className)}>
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold tracking-tight text-primary">Tingiapp</h1>
      </div>
      <div className="flex-1 overflow-auto py-4">
        <ul className="grid gap-1 px-2">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted",
                    isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
