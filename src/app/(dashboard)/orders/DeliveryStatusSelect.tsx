"use client";

import { useState } from "react";
import { updateDeliveryStatus } from "@/app/actions/order";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const statuses = [
  { value: "Pending", label: "Pending", color: "bg-slate-500" },
  { value: "Processing", label: "Processing", color: "bg-blue-500" },
  { value: "Out for Delivery", label: "Out for Delivery", color: "bg-amber-500" },
  { value: "Delivered", label: "Delivered", color: "bg-emerald-500" },
  { value: "Cancelled", label: "Cancelled", color: "bg-rose-500" },
];

export function DeliveryStatusSelect({ 
  orderId, 
  initialStatus 
}: { 
  orderId: string, 
  initialStatus: string 
}) {
  const [status, setStatus] = useState(initialStatus);
  const [loading, setLoading] = useState(false);

  const handleStatusChange = async (newStatus: string | null) => {
    if (!newStatus) return;
    setLoading(true);
    setStatus(newStatus);
    const res = await updateDeliveryStatus(orderId, newStatus);
    setLoading(false);
    
    if (res.success) {
      toast.success(`Status updated to ${newStatus}`);
    } else {
      toast.error(res.error || "Failed to update status");
      setStatus(initialStatus);
    }
  };

  const currentStatus = statuses.find(s => s.value === status) || statuses[0];

  return (
    <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
      <SelectTrigger className="w-[140px] h-8 text-[11px] font-bold uppercase tracking-tight rounded-lg border-0 bg-transparent hover:bg-black/5 transition-colors focus:ring-0 focus:ring-offset-0 ring-0">
        <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${currentStatus.color}`} />
            <SelectValue placeholder="Status" />
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-xl border-black/5 shadow-2xl">
        {statuses.map((s) => (
          <SelectItem key={s.value} value={s.value} className="text-[11px] font-bold uppercase tracking-tight">
            <div className="flex items-center gap-2">
                <div className={`h-2 w-2 rounded-full ${s.color}`} />
                {s.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
