"use client";

import { useState } from "react";
import { InvoiceModal } from "@/components/InvoiceModal";

export function OrderInvoiceWrapper({ order }: { order: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <InvoiceModal 
        order={order} 
        isOpen={isOpen} 
        onOpenChange={setIsOpen} 
        showTrigger={true} 
      />
    </>
  );
}
