"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { restockProduct } from "@/app/actions/inventory";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function RestockButton({ productId, productName }: { productId: string; productName: string }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const amount = parseInt(formData.get("amount") as string, 10);
    const notes = formData.get("notes") as string;

    const res = await restockProduct(productId, amount, notes);
    
    setLoading(false);
    if (res.success) {
      setOpen(false);
      // toast.success(`Successfully restocked ${productName}`);
    } else {
      alert("Failed to restock");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-9 px-3 text-primary hover:bg-primary/10 font-bold gap-2 rounded-xl">
          <PlusCircle className="h-4 w-4" />
          Restock
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-0 shadow-2xl bg-white/90 backdrop-blur-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">Restock Item</DialogTitle>
            <DialogDescription className="font-semibold">
              Adding stock for <span className="text-primary font-black">{productName}</span>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Quantity to Add</Label>
              <Input
                name="amount"
                type="number"
                min="1"
                required
                placeholder="e.g. 50"
                className="h-12 rounded-xl border-black/[0.05] bg-white font-bold"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Notes / Source</Label>
              <textarea
                name="notes"
                placeholder="e.g. From container of oil, sack of sugar..."
                className="w-full min-h-[100px] p-4 rounded-xl border border-black/[0.05] bg-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading} className="w-full rounded-2xl h-12 font-black shadow-lg shadow-primary/20 gap-2 text-lg">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Restock"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
