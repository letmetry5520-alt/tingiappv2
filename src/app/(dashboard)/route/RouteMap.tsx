"use client";

import { useState } from "react";
import { Map, Marker, Overlay } from "pigeon-maps";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Receipt, ShoppingCart, Filter } from "lucide-react";
import Link from "next/link";

interface CustomerData {
  id: string;
  storeName: string;
  latitude: number | null;
  longitude: number | null;
  balance: number;
  logisticsStatus: string | null;
}

export function RouteMap({ customers }: { customers: CustomerData[] }) {
  const [filter, setFilter] = useState<"all" | "collection" | "out-for-delivery" | "delivered">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Filter customers with valid coordinates
  const validCustomers = customers.filter(
    (c) => typeof c.latitude === "number" && typeof c.longitude === "number"
  );

  const displayedCustomers = validCustomers.filter((c) => {
    if (filter === "collection") return c.balance > 0;
    if (filter === "out-for-delivery") return c.logisticsStatus === "Out for Delivery";
    if (filter === "delivered") return c.logisticsStatus === "Delivered";
    return true;
  });

  // Calculate default center
  const defaultCenter: [number, number] =
    validCustomers.length > 0
      ? [validCustomers[0].latitude as number, validCustomers[0].longitude as number]
      : [14.5995, 120.9842]; // Manila as fallback

  return (
    <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2.5rem] overflow-hidden flex flex-col mb-8">
      <CardHeader className="pb-4 bg-slate-50/50 border-b border-black/[0.02] px-8 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <CardTitle className="text-xl font-black tracking-tight flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Route Overview Map
            </CardTitle>
            <CardDescription className="font-semibold text-xs">
              Plan your daily route. Showing {displayedCustomers.length} stops.
            </CardDescription>
          </div>
          
          <div className="flex flex-wrap bg-white shadow-inner rounded-xl p-1 gap-1 border border-slate-100">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFilter("all")}
              className={`rounded-lg h-9 text-xs font-bold transition-all ${filter === 'all' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900'}`}
            >
              All Stops
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFilter("out-for-delivery")}
              className={`rounded-lg h-9 text-xs font-bold transition-all ${filter === 'out-for-delivery' ? 'bg-amber-500 text-white shadow-md' : 'text-amber-500 hover:bg-amber-50'}`}
            >
              Out for Delivery
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFilter("delivered")}
              className={`rounded-lg h-9 text-xs font-bold transition-all ${filter === 'delivered' ? 'bg-emerald-500 text-white shadow-md' : 'text-emerald-500 hover:bg-emerald-50'}`}
            >
              Delivered
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFilter("collection")}
              className={`rounded-lg h-9 text-xs font-bold transition-all ${filter === 'collection' ? 'bg-rose-500 text-white shadow-md' : 'text-rose-500 hover:bg-rose-50'}`}
            >
              Collections
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <div className="relative h-[400px] w-full bg-slate-100">
        <Map defaultCenter={defaultCenter} defaultZoom={13} minZoom={5} maxZoom={18}>
          {displayedCustomers.map((c) => {
            const isCollection = c.balance > 0;
            const isSelected = selectedId === c.id;
            const isDelivered = c.logisticsStatus === "Delivered";
            const isOutForDelivery = c.logisticsStatus === "Out for Delivery";
            const isPending = c.logisticsStatus === "Pending" || c.logisticsStatus === "Processing";
            
            // Priority for map pins when showing "All"
            let pinType = "slate"; // Default no order
            if (filter === "delivered" || (filter === "all" && isDelivered)) pinType = "emerald";
            else if (filter === "out-for-delivery" || (filter === "all" && isOutForDelivery)) pinType = "amber";
            else if (filter === "all" && isPending) pinType = "blue"; // Optional to see processing/pending
            else if (filter === "collection" || (filter === "all" && isCollection)) pinType = "rose";

            return (
              <Overlay 
                key={c.id} 
                anchor={[c.latitude as number, c.longitude as number]} 
                offset={isSelected ? [30, 60] : [22.5, 45]}
              >
                <div 
                  className={`relative group cursor-pointer transition-all duration-300 ${isSelected ? 'scale-110 z-10' : 'hover:scale-110 z-0'}`}
                  onClick={() => setSelectedId(isSelected ? null : c.id)}
                >
                  {/* Pin Background */}
                  <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full blur-[2px] opacity-40 bg-black`}></div>
                  
                  {/* Pin Shape */}
                  <div className={`flex items-center justify-center p-2 rounded-2xl shadow-xl border-2 transition-all duration-300 backdrop-blur-md
                    ${pinType === "emerald" ? 'bg-emerald-500/90 border-emerald-300 text-white' : ''}
                    ${pinType === "amber" ? 'bg-amber-500/90 border-amber-300 text-white' : ''}
                    ${pinType === "blue" ? 'bg-blue-500/90 border-blue-300 text-white' : ''}
                    ${pinType === "rose" ? 'bg-rose-500/90 border-rose-300 text-white' : ''}
                    ${pinType === "slate" ? 'bg-slate-500/90 border-slate-300 text-white' : ''}
                  `}>
                    {pinType === "emerald" || pinType === "amber" || pinType === "blue" ? <ShoppingCart className="h-5 w-5" /> : 
                     pinType === "rose" ? <Receipt className="h-5 w-5" /> : 
                     <MapPin className="h-5 w-5" />}
                  </div>

                  {/* Tooltip */}
                  {isSelected && (
                     <div className="absolute bottom-[calc(100%+8px)] left-1/2 -translate-x-1/2 bg-white text-slate-900 px-4 py-3 rounded-xl shadow-2xl border border-slate-100 whitespace-nowrap min-w-[200px]">
                       <div className="font-black text-sm tracking-tight mb-1">{c.storeName}</div>
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase">Status</span>
                         <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                           isDelivered ? 'bg-emerald-100 text-emerald-700' :
                           isOutForDelivery ? 'bg-amber-100 text-amber-700' :
                           isPending ? 'bg-blue-100 text-blue-700' :
                           'bg-slate-100 text-slate-700'
                         }`}>
                           {c.logisticsStatus || 'No Order Yet'}
                         </span>
                       </div>
                       <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] font-bold text-muted-foreground uppercase">Balance</span>
                         <span className={`text-xs font-black ${isCollection ? 'text-rose-600' : 'text-slate-600'}`}>
                           ₱{c.balance.toFixed(2)}
                         </span>
                       </div>
                       <div className="grid grid-cols-2 gap-2 mt-2">
                          <Button size="sm" variant="outline" className="h-8 text-[10px] font-bold" asChild>
                             <a href={`https://maps.google.com/?q=${c.latitude},${c.longitude}`} target="_blank" rel="noreferrer">
                               Directions
                             </a>
                          </Button>
                          <Button size="sm" className="h-8 text-[10px] font-bold" asChild>
                            <Link href={`/customers/${c.id}`}>Details</Link>
                          </Button>
                       </div>
                       {/* Triangle pointer */}
                       <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b border-r border-slate-100 transform rotate-45"></div>
                     </div>
                  )}
                </div>
              </Overlay>
            );
          })}
        </Map>
      </div>
    </Card>
  );
}
