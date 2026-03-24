"use client";

import { useState } from "react";
import { InvoiceModal } from "@/components/InvoiceModal";
import { MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function OrderInvoiceWrapper({ order }: { order: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
    <TooltipProvider>
      <div className="flex gap-1.5 items-center">
        {order.customer?.latitude && order.customer?.longitude && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-500 hover:bg-blue-50/50 rounded-lg shrink-0" asChild>
                <a href={`https://maps.google.com/?q=${order.customer.latitude},${order.customer.longitude}`} target="_blank" rel="noreferrer">
                  <MapPin className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 text-white border-0 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg">
              Navigate
            </TooltipContent>
          </Tooltip>
        )}

        {order.customer?.phone && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-500 hover:bg-emerald-50/50 rounded-lg shrink-0" asChild>
                <a href={`tel:${order.customer.phone}`} className="h-4 w-4">
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent className="bg-slate-900 text-white border-0 font-bold text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-lg">
              Call {order.customer.storeName}
            </TooltipContent>
          </Tooltip>
        )}

        <InvoiceModal 
          order={order} 
          isOpen={isOpen} 
          onOpenChange={setIsOpen} 
          showTrigger={true} 
        />
      </div>
    </TooltipProvider>
    </>
  );
}
