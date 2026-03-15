"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlarmClock, Banknote, CheckCircle2, Circle, Clock, Filter, XCircle } from "lucide-react";

const STATUS_FILTERS = [
  { label: "All", value: "all", icon: Circle },
  { label: "Pending", value: "pending", icon: XCircle },
  { label: "Paid", value: "paid", icon: CheckCircle2 },
  { label: "Due Today", value: "due_today", icon: AlarmClock },
  { label: "Overdue", value: "overdue", icon: Clock },
];

const TYPE_FILTERS = [
  { label: "All Types", value: "all" },
  { label: "Cash", value: "cash" },
  { label: "Utang", value: "utang" },
];

export function OrdersFilter({ totalDueToday, totalOverdue }: { totalDueToday: number; totalOverdue: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const status = searchParams.get("status") || "all";
  const type = searchParams.get("type") || "all";

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 bg-white/50 backdrop-blur-xl p-4 rounded-2xl border border-white/40 shadow-sm">
      <div className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Filters</span>
        {(status !== "all" || type !== "all") && (
          <button
            onClick={() => { setFilter("status", "all"); setFilter("type", "all"); }}
            className="ml-auto text-[10px] font-bold text-rose-500 hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Status Row */}
      <div className="flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => {
          const Icon = f.icon;
          const isActive = status === f.value || (f.value === "all" && status === "all");
          const badge =
            f.value === "due_today" && totalDueToday > 0 ? totalDueToday :
            f.value === "overdue" && totalOverdue > 0 ? totalOverdue : null;
          return (
            <button
              key={f.value}
              onClick={() => setFilter("status", f.value)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-200 border",
                isActive
                  ? f.value === "due_today"
                    ? "bg-amber-500 text-white border-amber-500 shadow-md shadow-amber-200"
                    : f.value === "overdue"
                    ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200"
                    : "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              )}
            >
              <Icon className="h-3 w-3" />
              {f.label}
              {badge && (
                <span className={cn(
                  "ml-0.5 text-[9px] font-black px-1.5 py-0.5 rounded-full",
                  isActive ? "bg-white/30" : f.value === "due_today" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                )}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Type Row */}
      <div className="flex gap-2">
        {TYPE_FILTERS.map((f) => {
          const isActive = type === f.value || (f.value === "all" && type === "all");
          return (
            <button
              key={f.value}
              onClick={() => setFilter("type", f.value)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 border",
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              )}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
