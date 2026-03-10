"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";

export function DashboardFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentFilter = searchParams.get("filter") || "today";
  const [startDate, setStartDate] = React.useState(searchParams.get("start") || "");
  const [endDate, setEndDate] = React.useState(searchParams.get("end") || "");

  const handleFilterChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    params.set("filter", value);
    if (value !== "custom") {
      params.delete("start");
      params.delete("end");
    }
    router.push(`?${params.toString()}`);
  };

  const applyCustomRange = () => {
    const params = new URLSearchParams(searchParams);
    params.set("filter", "custom");
    params.set("start", startDate);
    params.set("end", endDate);
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-card/50 backdrop-blur-md p-4 rounded-3xl border border-border/50 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-primary/20">
      <div className="flex items-center gap-2 px-2">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <Filter className="w-4 h-4" />
        </div>
        <span className="text-xs font-black text-foreground uppercase tracking-widest opacity-70">Filters</span>
      </div>
      
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "today", label: "Today" },
          { id: "weekly", label: "Weekly" },
          { id: "monthly", label: "Monthly" },
          { id: "yearly", label: "Yearly" },
          { id: "custom", label: "Custom Range" },
        ].map((option) => (
          <button
            key={option.id}
            onClick={() => handleFilterChange(option.id)}
            className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border h-10 ${
              currentFilter === option.id
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25 scale-105"
                : "bg-background/40 text-muted-foreground border-border/50 hover:bg-background/80 hover:border-primary/30 hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        ))}

        <div className="mx-2 h-6 w-px bg-border/30 hidden sm:block" />

        {currentFilter === "custom" && (
          <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-500">
            <div className="relative group">
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-[150px] bg-background/50 border-border/50 rounded-2xl h-10 font-bold px-4 focus:ring-primary/20 transition-all"
              />
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter opacity-30">to</span>
            <div className="relative group">
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-[150px] bg-background/50 border-border/50 rounded-2xl h-10 font-bold px-4 focus:ring-primary/20 transition-all"
              />
            </div>
            <Button 
              onClick={applyCustomRange}
              size="sm"
              className="rounded-2xl font-black uppercase tracking-tighter text-[10px] h-10 px-6 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              Apply Filter
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
