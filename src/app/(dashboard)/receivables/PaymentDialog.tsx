"use client";

import { useState } from "react";
import { processPayment } from "@/app/actions/payment";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type OrderToPay = {
  id: string;
  total: number;
  payments: Array<{ amount: number }>;
}

export function PaymentDialog({ 
  order, 
  triggerText = "Collect Payment", 
  variant = "default" 
}: { 
  order: OrderToPay, 
  triggerText?: string, 
  variant?: "default" | "outline" | "ghost" | "secondary" 
}) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  
  const alreadyPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
  const remaining = order.total - alreadyPaid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payAmount = parseFloat(amount);
    if (!payAmount || payAmount <= 0) return alert("Invalid amount");
    if (payAmount > remaining + 0.01) return alert("Amount exceeds balance");

    setLoading(true);
    const res = await processPayment(order.id, payAmount);
    setLoading(false);
    
    if (res.success) {
      setOpen(false);
      setAmount("");
    } else {
      alert("error" in res ? res.error : "Failed to process payment");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={variant}>{triggerText}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Enter the amount collected for this utang.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Total Owed</Label>
              <div className="col-span-3 font-semibold">₱{order.total.toFixed(2)}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Remaining</Label>
              <div className="col-span-3 text-red-600 font-bold">₱{remaining.toFixed(2)}</div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                Amount (₱)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                max={remaining.toFixed(2)}
                className="col-span-3"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setAmount(remaining.toString())}>
              Pay Full
            </Button>
            <Button type="submit" disabled={loading || !amount}>
              {loading ? "Processing..." : "Confirm Payment"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
