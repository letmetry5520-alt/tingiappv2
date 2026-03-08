"use client";

import { useState } from "react";
import { addTransaction } from "@/app/actions/finance";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

export function FinanceDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [category, setCategory] = useState("Fuel");

  const categories = {
    Income: [
      { value: "Investment", label: "Owner Investment" },
      { value: "Refund", label: "Supplier Refund" },
      { value: "Misc_In", label: "Other Income" },
    ],
    Expense: [
      { value: "Fuel", label: "Delivery Fuel" },
      { value: "Restock", label: "Restocking Inventory" },
      { value: "Packaging", label: "Packaging Supplies" },
      { value: "Salary", label: "Salary / Wages" },
      { value: "Maintenance", label: "Vehicle Maintenance" },
      { value: "Misc_Out", label: "Miscellaneous" },
    ]
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.set("type", type);
    formData.set("category", category);
    
    const res = await addTransaction(formData);
    setLoading(false);
    
    if (res.success) {
      setOpen(false);
    } else {
      alert("Failed to save transaction");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95">
          <Plus className="mr-2 h-5 w-5" />
          Add Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] rounded-[2.5rem] border-0 shadow-2xl bg-white/90 backdrop-blur-3xl overflow-hidden p-0">
        <form onSubmit={onSubmit}>
          <div className="p-8 space-y-8">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                <Wallet className="h-7 w-7 text-primary" />
                Quick Entry
              </DialogTitle>
              <DialogDescription className="text-sm font-semibold text-muted-foreground mt-2 leading-relaxed">
                Log financial movements to keep your books balanced.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-8">
              {/* Type Toggle */}
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Flow Direction</Label>
                <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/50 rounded-2xl border border-black/[0.03]">
                  <button
                    type="button"
                    onClick={() => { setType("Income"); setCategory("Investment"); }}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm",
                      type === "Income" ? "bg-white text-emerald-600 shadow-sm ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <ArrowUpCircle className="h-4 w-4" /> Income
                  </button>
                  <button
                    type="button"
                    onClick={() => { setType("Expense"); setCategory("Fuel"); }}
                    className={cn(
                      "flex items-center justify-center gap-2 py-3 rounded-xl transition-all font-bold text-sm",
                      type === "Expense" ? "bg-white text-rose-600 shadow-sm ring-1 ring-black/5" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    <ArrowDownCircle className="h-4 w-4" /> Expense
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Category</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-12 rounded-xl border-black/[0.05] bg-white text-sm font-bold shadow-sm">
                      <SelectValue placeholder="Purpose" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 shadow-2xl">
                      {categories[type].map(cat => (
                        <SelectItem key={cat.value} value={cat.value} className="font-bold py-3">{cat.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Value (₱)</Label>
                  <Input 
                    id="amount" 
                    name="amount" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="0.00" 
                    required 
                    className="h-12 rounded-xl border-black/[0.05] bg-white font-black text-slate-900 shadow-sm"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Reference Notes</Label>
                <Input 
                  id="description" 
                  name="description" 
                  placeholder="Details of the transaction..." 
                  required 
                  className="h-12 rounded-xl border-black/[0.05] bg-white font-semibold text-slate-900 shadow-sm"
                />
              </div>

              <div className="space-y-3 text-right">
                 <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mr-1">Transaction Date</Label>
                 <Input 
                   id="date" 
                   name="date" 
                   type="date" 
                   defaultValue={new Date().toISOString().split('T')[0]} 
                   required 
                   className="h-12 rounded-xl border-black/[0.05] bg-white font-bold text-slate-900 shadow-sm"
                 />
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-50/50 border-t border-black/[0.03] grid grid-cols-2 gap-4">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="rounded-2xl h-12 font-bold text-slate-500 hover:text-slate-900">
              Discard
            </Button>
            <Button type="submit" disabled={loading} className={cn(
              "rounded-2xl h-12 font-black uppercase tracking-widest shadow-lg transition-all",
              type === "Income" ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20" : "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20"
            )}>
              {loading ? "Recording..." : `Post ${type}`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
