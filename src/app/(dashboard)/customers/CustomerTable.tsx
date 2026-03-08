"use client";

import { useState } from "react";
import { Customer } from "@prisma/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Search, ChevronRight, Phone } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function CustomerTable({ data }: { data: Customer[] }) {
  const [search, setSearch] = useState("");

  const filteredData = data.filter((c) => 
    c.storeName.toLowerCase().includes(search.toLowerCase()) || 
    c.ownerName.toLowerCase().includes(search.toLowerCase()) ||
    (c.zoneName && c.zoneName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-0">
      <div className="p-6 bg-slate-50/20 border-b border-black/[0.02] sm:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search stores..."
            className="pl-9 bg-white/80 border-0 shadow-inner rounded-xl h-12"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-0">
            <TableHead className="px-8 h-12 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Store Details</TableHead>
            <TableHead className="h-12 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Logistics / Route</TableHead>
            <TableHead className="h-12 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Communication</TableHead>
            <TableHead className="px-8 h-12 text-right font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Portal</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium">
                <div className="flex flex-col items-center gap-2">
                  <Search className="h-8 w-8 opacity-20" />
                  No store accounts match your search.
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredData.map((c) => (
              <TableRow key={c.id} className="group hover:bg-black/[0.01] transition-all duration-300 border-b border-black/[0.02] last:border-0 h-20">
                <TableCell className="px-8">
                   <div className="flex flex-col">
                     <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{c.storeName}</span>
                     <span className="text-xs font-semibold text-muted-foreground/80">{c.ownerName}</span>
                   </div>
                </TableCell>
                <TableCell>
                  {c.zoneName ? (
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant="outline" className="rounded-lg bg-indigo-50/50 border-indigo-200/50 text-indigo-700 font-bold text-[10px] py-0">
                        {c.zoneName}
                      </Badge>
                      {c.routeDay && <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{c.routeDay}</span>}
                    </div>
                  ) : (
                    <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-0 font-bold text-[10px]">Unassigned</Badge>
                  )}
                </TableCell>
                <TableCell>
                   <div className="flex items-center gap-1.5 text-slate-600 font-semibold text-xs">
                     <Phone className="h-3 w-3 opacity-40" />
                     {c.phone}
                   </div>
                </TableCell>
                <TableCell className="px-8 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {c.latitude && c.longitude && (
                      <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-blue-200 bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm" asChild>
                        <a href={`https://maps.google.com/?q=${c.latitude},${c.longitude}`} target="_blank" rel="noreferrer">
                          <MapPin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 bg-white shadow-sm" asChild>
                      <Link href={`/customers/${c.id}`}>
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  {/* Fallback for touch devices or if hover is tricky */}
                  <div className="sm:hidden">
                     <Link href={`/customers/${c.id}`} className="p-2 inline-block">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                     </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
