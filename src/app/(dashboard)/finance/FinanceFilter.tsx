"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Filter } from "lucide-react";

export function FinanceFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentFilter = searchParams.get("filter") || "today";

  const handleFilterChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    params.set("filter", value);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-white/40 backdrop-blur-md p-4 rounded-3xl border border-white/60 shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="flex items-center gap-2 px-2">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <Filter className="w-4 h-4" />
        </div>
        <span className="text-xs font-black text-slate-900 uppercase tracking-widest opacity-70">Timespan</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "today", label: "Today" },
          { id: "weekly", label: "Weekly" },
          { id: "monthly", label: "Monthly" },
          { id: "yearly", label: "Yearly" },
          { id: "all", label: "All Time" },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => handleFilterChange(option.id)}
            className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border h-10 ${
              currentFilter === option.id
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/25 scale-105"
                : "bg-white/40 text-slate-600 border-slate-200/50 hover:bg-white/80 hover:border-primary/30 hover:text-slate-900"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
