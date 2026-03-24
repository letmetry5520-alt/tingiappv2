"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Receipt, Calendar, Package, Truck, Clock } from "lucide-react";
import { format } from "date-fns";

type OrderItem = {
  type: "product" | "package";
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type OrderDetailsProps = {
  order: {
    id: string;
    createdAt: Date;
    total: number;
    status: string;
    deliveryStatus: string;
    paymentType: string;
    items: any; // Will cast to OrderItem[]
    adjustments?: any;
  };
};

export function OrderDetailsDialog({ order }: OrderDetailsProps) {
  const items = order.items as OrderItem[];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2 rounded-lg border-primary/20 hover:border-primary/50 hover:bg-primary/5">
          <Eye className="h-3.5 w-3.5" />
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-0 shadow-2xl bg-white/90 backdrop-blur-3xl overflow-hidden">
        <DialogHeader className="pb-6 border-b border-black/[0.03]">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">Order Summary</DialogTitle>
              <DialogDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground mt-1">
                Ref: #{order.id.slice(-8).toUpperCase()}
              </DialogDescription>
            </div>
            <Badge variant={order.status === "Paid" ? "default" : "secondary"} className="rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-tighter">
              {order.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-black/[0.03] space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <Truck className="h-3 w-3" /> Delivery
              </div>
              <div className="text-sm font-black text-slate-900">{order.deliveryStatus}</div>
            </div>
            <div className="p-4 bg-slate-50/50 rounded-2xl border border-black/[0.03] space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                <Clock className="h-3 w-3" /> Placed On
              </div>
              <div className="text-sm font-black text-slate-900">{format(new Date(order.createdAt), "MMM dd, hh:mm a")}</div>
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground mb-4">
              <Package className="h-3.5 w-3.5" /> Manifest
            </div>
            <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-black/[0.02] shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-black border border-black/[0.03] ${item.type === "package" ? "bg-indigo-50 text-indigo-500 shadow-inner" : "bg-slate-100 text-slate-400"}`}>
                        {item.quantity}x
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-bold text-slate-900">{item.name}</div>
                          {item.type === "package" && (
                            <Badge className="bg-indigo-500 hover:bg-indigo-600 text-[8px] h-4 px-1.5 font-black uppercase tracking-tighter">Package</Badge>
                          )}
                        </div>
                        <div className="text-[10px] font-medium text-muted-foreground">₱{item.price.toFixed(2)} per unit</div>
                      </div>
                    </div>
                    <div className="text-sm font-black text-slate-900">
                      ₱{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                  
                  {/* Package Bundle Breakdown */}
                  {item.type === "package" && (item as any).packageItems && (
                    <div className="ml-6 pl-4 border-l-2 border-indigo-100 py-1 space-y-1.5">
                      <div className="text-[9px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-1.5 mb-2">
                        <div className="w-1 h-1 rounded-full bg-indigo-300" /> Bundle Contents
                      </div>
                      {(item as any).packageItems.map((pItem: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-[11px] bg-slate-50/50 p-2 rounded-lg border border-black/[0.01]">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-indigo-600 bg-indigo-50 px-1 rounded">{pItem.quantity * item.quantity}x</span>
                            <span className="font-semibold text-slate-600">{pItem.name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Adjustments Section */}
          {(order as any).adjustments && (order as any).adjustments.length > 0 && (
            <div className="pt-4 border-t border-black/[0.03] space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <span>Subtotal</span>
                <span>₱{(order.total + (order as any).adjustments.reduce((acc: number, adj: any) => acc + (adj.amount || 0), 0)).toFixed(2)}</span>
              </div>
              {(order as any).adjustments.map((adj: any, idx: number) => (
                <div key={idx} className="flex justify-between items-center text-xs font-bold text-rose-500 bg-rose-50/50 p-2 rounded-xl border border-rose-100/50">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                    <span>{adj.reason}</span>
                  </div>
                  <span>- ₱{(adj.amount || 0).toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {/* Grand Total */}
          <div className="pt-6 border-t border-black/[0.03] flex justify-between items-end">
            <div>
                <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1 flex items-center gap-2">
                    <Receipt className="h-3 w-3" /> Resulting Total
                </div>
                <Badge variant="outline" className="rounded-lg text-[10px] uppercase font-bold text-primary border-primary/20 bg-primary/5">
                    {order.paymentType} Transaction
                </Badge>
            </div>
            <div className="text-3xl font-black tracking-tighter text-slate-900">
              ₱{order.total.toFixed(2)}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
