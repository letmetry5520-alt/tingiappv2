"use client";

import { useState, useTransition } from "react";
import { toggleDelinquentStatus } from "@/app/actions/customer";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DelinquentToggleProps {
  customerId: string;
  isDelinquent: boolean;
  storeName: string;
}

export function DelinquentToggle({ customerId, isDelinquent: initialIsDelinquent, storeName }: DelinquentToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [isDelinquent, setIsDelinquent] = useState(initialIsDelinquent);

  const handleToggle = () => {
    startTransition(async () => {
      // Optimistic update
      const newValue = !isDelinquent;
      setIsDelinquent(newValue);

      const result = await toggleDelinquentStatus(customerId);
      if (result.success) {
        toast.success(
          newValue 
            ? `${storeName} marked as delinquent` 
            : `${storeName} marked as safe`
        );
      } else {
        // Rollback
        setIsDelinquent(!newValue);
        toast.error(result.error || "Failed to update status");
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "rounded-xl h-9 px-3 font-bold transition-all duration-300 gap-1.5",
        isDelinquent 
          ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 hover:text-rose-700" 
          : "text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
      )}
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : isDelinquent ? (
        <ShieldAlert className="h-3.5 w-3.5" />
      ) : (
        <ShieldCheck className="h-3.5 w-3.5" />
      )}
      <span className="text-[10px] uppercase tracking-wider">
        {isDelinquent ? "Delinquent" : "Mark Delinquent"}
      </span>
    </Button>
  );
}
