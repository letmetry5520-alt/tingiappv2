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
    <nav className={cn("hidden md:flex flex-col w-64 border-r border-border/50 bg-muted/20 backdrop-blur-sm h-full transition-colors duration-300", className)}>
      <div className="p-8 border-b border-border/50">
        <h1 className="text-3xl font-black tracking-tighter text-primary bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
          Tingi<span className="text-foreground">app</span>
        </h1>
      </div>
      <div className="flex-1 overflow-auto py-6">
        <div className="px-4 mb-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50">
          Main Navigation
        </div>
        <ul className="grid gap-1.5 px-3">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold transition-all duration-200 group relative overflow-hidden",
                    isActive 
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]" 
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80 active:scale-95"
                  )}
                >
                  <link.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "" : "text-muted-foreground/70 group-hover:text-primary")} />
                  {link.name}
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-white/20 rounded-l-full" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      {isAdmin && (
        <div className="p-4 mt-auto border-t border-border/50">
          <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-[10px] font-black uppercase tracking-tighter text-primary">Admin Access</span>
            </div>
            <p className="text-[10px] text-muted-foreground leading-tight">
              You have full system access enabled.
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}
