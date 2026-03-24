"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PaymentDialog } from "./PaymentDialog";
import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Clock, Receipt, Search, MessageSquare, Phone, Facebook, MessageCircle, MapPin } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import { BulkMessageModal } from "@/components/BulkMessageModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export function ReceivablesTable({ initialOrders }: { initialOrders: any[] }) {
  const [search, setSearch] = useState("");
  const today = new Date();

  // Extract unique customers from unpaid orders for the modal
  const uniqueCustomers = Array.from(
    new Map(initialOrders.map(o => [o.customer.id, o.customer])).values()
  );

  const filteredOrders = initialOrders.filter((o) => {
    const matchesSearch = 
      o.customer.storeName.toLowerCase().includes(search.toLowerCase()) || 
      o.customer.ownerName.toLowerCase().includes(search.toLowerCase());
    
    return matchesSearch;
  });

  const calculateStatus = (dueDate: Date | null) => {
    if (!dueDate) return { color: "bg-slate-500", label: "No Due Date", icon: Clock };
    const daysDiff = differenceInDays(dueDate, today);
    if (daysDiff < 0) return { color: "bg-rose-500 text-white", label: `${Math.abs(daysDiff)} Day(s) Overdue`, icon: AlertCircle };
    if (daysDiff === 0) return { color: "bg-orange-500 text-white", label: "Due Today", icon: Clock };
    if (daysDiff <= 2) return { color: "bg-amber-400 text-amber-900", label: "Due Soon", icon: Clock };
    return { color: "bg-emerald-500 text-white", label: `Safe (${daysDiff} days left)`, icon: CheckCircle2 };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search accounts..."
            className="w-full pl-9 h-11 bg-white/60 border-0 rounded-2xl shadow-sm ring-1 ring-black/5 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <BulkMessageModal customers={uniqueCustomers} />
      </div>

      <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2rem] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-0">
               <TableHead className="px-8 h-14 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Partner Store</TableHead>
               <TableHead className="h-14 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Transaction ID</TableHead>
               <TableHead className="h-14 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Lifeline / Due Date</TableHead>
               <TableHead className="h-14 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Impact Amount</TableHead>
               <TableHead className="h-14 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Location</TableHead>
               <TableHead className="h-14 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Communication</TableHead>
               <TableHead className="px-8 h-14 text-right font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Operations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-48 text-center text-muted-foreground font-medium">
                   <div className="flex flex-col items-center gap-3">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 opacity-30" />
                      No records found.
                   </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => {
                const status = calculateStatus(order.dueDate);
                const alreadyPaid = (order.payments || []).reduce((sum: number, p: any) => sum + p.amount, 0);
                const remaining = order.total - alreadyPaid;

                return (
                  <TableRow key={order.id} className="group hover:bg-black/[0.01] transition-all border-b border-black/[0.02] last:border-0 h-24">
                    <TableCell className="px-8">
                       <Link href={`/customers/${order.customerId}`} className="flex flex-col group/link">
                         <span className="font-bold text-slate-900 group-hover/link:text-primary transition-colors text-base italic uppercase">{order.customer.storeName}</span>
                         <span className="text-xs font-semibold text-muted-foreground/70">{order.customer.ownerName}</span>
                       </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] bg-slate-100/50 border-0 rounded-lg py-0 px-2">#{order.id.slice(-6).toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      {order.dueDate && (
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="text-xs font-black uppercase text-slate-800 tracking-tight">{format(new Date(order.dueDate), 'MMM dd, yyyy')}</span>
                          <Badge className={`${status.color} border-0 rounded-lg px-2 text-[9px] font-black uppercase tracking-tight shadow-sm flex items-center gap-1`}>
                             <status.icon className="h-2.5 w-2.5" />
                             {status.label}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="font-black text-rose-600 text-lg tracking-tighter">₱{remaining.toFixed(2)}</span>
                          <span className="text-[10px] font-bold text-muted-foreground mt-0.5">Total: ₱{order.total.toFixed(2)}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                      {order.customer.latitude && order.customer.longitude ? (
                        <Button variant="outline" size="sm" className="h-8 px-3 rounded-lg border-blue-200 bg-blue-50/30 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm font-bold text-[10px] gap-2" asChild>
                          <a href={`https://maps.google.com/?q=${order.customer.latitude},${order.customer.longitude}`} target="_blank" rel="noreferrer">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="hidden lg:inline">Map</span>
                          </a>
                        </Button>
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground opacity-30 italic">No GPS</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className={cn("flex items-center gap-3", order.customer.isBanned && "opacity-30 grayscale pointer-events-none")}>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild nativeButton={false}>
                              <a 
                                href={`sms:${order.customer.phone}`}
                                className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-500 hover:text-white transition-all border border-black/[0.05] shadow-sm transform hover:-translate-y-1"
                              >
                                <MessageSquare className="h-4 w-4" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg">
                              Send SMS
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild nativeButton={false}>
                              <a 
                                href={`tel:${order.customer.phone}`}
                                className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-emerald-500 hover:text-white transition-all border border-black/[0.05] shadow-sm transform hover:-translate-y-1"
                              >
                                <Phone className="h-4 w-4" />
                              </a>
                            </TooltipTrigger>
                            <TooltipContent className="bg-slate-900 text-white border-0 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg">
                              Call Owner
                            </TooltipContent>
                          </Tooltip>

                          {order.customer.facebook && (
                            <Tooltip>
                              <TooltipTrigger asChild nativeButton={false}>
                                <a 
                                  href={order.customer.facebook.startsWith('http') ? order.customer.facebook : `https://m.me/${order.customer.facebook.replace('@', '')}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-blue-600 hover:text-white transition-all border border-black/[0.05] shadow-sm transform hover:-translate-y-1"
                                >
                                  {order.customer.facebook.includes('facebook') ? <Facebook className="h-4 w-4" /> : <MessageCircle className="h-4 w-4" />}
                                </a>
                              </TooltipTrigger>
                              <TooltipContent className="bg-slate-900 text-white border-0 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg">
                                Message on FB
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TooltipProvider>
                      </div>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      <PaymentDialog order={{ 
                        id: order.id, 
                        total: order.total, 
                        payments: order.payments,
                        adjustments: order.adjustments
                      }} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
