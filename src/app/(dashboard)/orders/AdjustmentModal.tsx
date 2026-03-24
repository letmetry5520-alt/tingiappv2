"use client";

import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Settings2, Loader2, MinusCircle } from "lucide-react";
import { adjustOrder } from "@/app/actions/order";
import { toast } from "sonner";

interface AdjustmentModalProps {
  orderId: string;
  storeName: string;
}

export function AdjustmentModal({ orderId, storeName }: AdjustmentModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!reason.trim()) {
      toast.error("Please enter a reason for the adjustment");
      return;
    }

    startTransition(async () => {
      const result = await adjustOrder(orderId, parseFloat(amount), reason);
      if (result.success) {
        toast.success("Order adjusted successfully");
        setIsOpen(false);
        setAmount("");
        setReason("");
      } else {
        toast.error(result.error || "Failed to adjust order");
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-xl h-9 px-3 font-bold text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300 gap-1.5 transition-all duration-300"
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span className="text-[10px] uppercase tracking-wider">Adjust</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-[2rem] border-0 shadow-2xl bg-white/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tighter flex items-center gap-2">
            <MinusCircle className="h-6 w-6 text-rose-500" />
            Adjust Payment
          </DialogTitle>
          <div className="text-sm text-muted-foreground font-medium">
            Deducting from {storeName}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Amount to Deduct (₱)</label>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="rounded-2xl h-12 bg-slate-50 border-slate-100 focus:ring-2 focus:ring-blue-500 font-bold text-lg"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Reason / Notes</label>
            <Textarea
              placeholder="e.g., Crack eggs, damaged goods..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="rounded-2xl min-h-[100px] bg-slate-50 border-slate-100 focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button 
              type="submit" 
              disabled={isPending}
              className="w-full rounded-2xl h-12 font-black uppercase tracking-widest bg-slate-900 hover:bg-black text-white shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Applying...
                </>
              ) : (
                "Confirm Deduction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
