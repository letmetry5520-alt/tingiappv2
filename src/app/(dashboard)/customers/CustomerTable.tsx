"use client";

import { useState } from "react";
import { Customer } from "@prisma/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, ChevronRight, Phone } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CustomerTable({ data }: { data: any[] }) {
  const [search, setSearch] = useState("");
  const [creditFilter, setCreditFilter] = useState<"all" | "active" | "none">("all");

  const filteredData = data.filter((c) => {
    const matchesSearch = 
      c.storeName.toLowerCase().includes(search.toLowerCase()) || 
      c.ownerName.toLowerCase().includes(search.toLowerCase()) ||
      (c.zoneName && c.zoneName.toLowerCase().includes(search.toLowerCase()));

    const hasCredit = c.orders && c.orders.length > 0;
    const matchesCredit = 
      creditFilter === "all" || 
      (creditFilter === "active" && hasCredit) || 
      (creditFilter === "none" && !hasCredit);

    return matchesSearch && matchesCredit;
  });

  return (
    <div className="space-y-0">
      <div className="p-6 bg-slate-50/20 border-b border-black/[0.02] space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search stores..."
              className="pl-9 bg-white border-0 shadow-inner rounded-xl h-12 ring-1 ring-black/5"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex bg-white/60 p-1 rounded-xl ring-1 ring-black/5 backdrop-blur-sm shrink-0">
            {[
              { id: "all", label: "All" },
              { id: "active", label: "Has Credit" },
              { id: "none", label: "No Credit" }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setCreditFilter(f.id as any)}
                className={cn(
                  "px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                  creditFilter === f.id 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-slate-50/50 hidden md:table-header-group">
          <TableRow className="hover:bg-transparent border-0">
            <TableHead className="px-8 h-12 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Store Details</TableHead>
            <TableHead className="h-12 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Logistics / Route</TableHead>
            <TableHead className="h-12 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Credit Status</TableHead>
            <TableHead className="h-12 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Location</TableHead>
            <TableHead className="h-12 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Communication</TableHead>
            <TableHead className="px-8 h-12 text-right font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Portal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="block md:table-row-group">
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-48 text-center text-muted-foreground font-medium">
                <div className="flex flex-col items-center gap-3">
                  <Search className="h-10 w-10 opacity-10" />
                  <p className="text-sm font-bold opacity-40 uppercase tracking-widest">No matching partners found</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((c: any) => {
              const hasCredit = c.orders && c.orders.length > 0;
              return (
                <TableRow key={c.id} className="group hover:bg-black/[0.01] transition-all duration-300 border-b border-black/[0.02] last:border-0 md:h-20 block md:table-row relative">
                  <TableCell className="px-4 md:px-8 block md:table-cell pt-6 md:pt-0">
                     <div className="flex items-center gap-4">
                       <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-slate-100 border border-black/[0.1] ring-1 ring-black/5 flex items-center justify-center transition-all group-hover:shadow-lg group-hover:shadow-primary/10">
                         {c.image ? (
                           <img src={c.image} alt={c.storeName} className="h-full w-full object-cover" />
                         ) : (
                           <div className="text-muted-foreground/30 font-black text-xs">{c.storeName.charAt(0)}</div>
                         )}
                       </div>
                       <div className="flex flex-col">
                         <span className="font-black text-slate-900 group-hover:text-primary transition-colors text-base tracking-tight leading-tight uppercase italic">{c.storeName}</span>
                         <span className="text-xs font-bold text-muted-foreground/60">{c.ownerName}</span>
                       </div>
                     </div>
                  </TableCell>
                  <TableCell className="px-4 md:px-0 block md:table-cell py-2 md:py-0 pl-16 md:pl-0">
                    <div className="flex flex-row md:flex-col gap-2 md:gap-1 items-center md:items-start flex-wrap">
                      {c.zoneName ? (
                        <Badge variant="outline" className="rounded-lg bg-indigo-50/50 border-indigo-200/50 text-indigo-700 font-bold text-[9px] py-0 px-2 h-5">
                          {c.zoneName}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-slate-100/50 text-slate-400 border-0 font-bold text-[9px] h-5">Unassigned</Badge>
                      )}
                      {c.routeDay && <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/40">{c.routeDay}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 md:px-0 block md:table-cell py-2 md:py-0 pl-16 md:pl-0">
                     <Badge 
                       className={cn(
                         "rounded-full px-3 py-0.5 font-black text-[9px] uppercase tracking-widest border-0",
                         hasCredit 
                           ? "bg-rose-500/10 text-rose-600 shadow-sm" 
                           : "bg-emerald-500/10 text-emerald-600 shadow-sm"
                       )}
                       variant="outline"
                     >
                       {hasCredit ? "Active Credit" : "None"}
                     </Badge>
                  </TableCell>
                  <TableCell className="px-4 md:px-0 block md:table-cell py-2 md:py-0 pl-16 md:pl-0">
                    {c.latitude && c.longitude ? (
                      <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-blue-200 bg-blue-50/30 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm font-bold text-[10px] gap-2" asChild>
                        <a href={`https://maps.google.com/?q=${c.latitude},${c.longitude}`} target="_blank" rel="noreferrer">
                          <MapPin className="h-3.5 w-3.5" />
                          <span className="hidden lg:inline">Map</span>
                        </a>
                      </Button>
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground opacity-30 italic">No GPS</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 md:px-0 block md:table-cell py-2 md:py-0 pb-6 md:pb-0 pl-16 md:pl-0">
                     <a 
                       href={`tel:${c.phone}`}
                       className="flex items-center gap-1.5 text-slate-600 font-bold text-xs hover:text-primary transition-colors group/tel"
                     >
                       <Phone className="h-3 w-3 opacity-30 shrink-0 group-hover/tel:text-primary transition-colors" />
                       {c.phone}
                     </a>
                  </TableCell>
                  <TableCell className="px-4 md:px-8 md:text-right block md:table-cell py-4 md:py-0 absolute top-4 right-0 md:static">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 bg-white shadow-md hover:bg-primary hover:text-white hover:border-primary transition-all group-hover:scale-105" asChild>
                      <Link href={`/customers/${c.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
