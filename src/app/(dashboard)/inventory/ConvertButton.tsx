"use client";

import { useState, useEffect } from "react";
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
import { convertProduct } from "@/app/actions/inventory";
import { Repeat, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  unit: string;
  category: string;
  cost: number;
}

export function ConvertButton({ 
  sourceProduct, 
  allProducts 
}: { 
  sourceProduct: Product; 
  allProducts: Product[] 
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [targetUnit, setTargetUnit] = useState<string>("pack");
  const [isOtherUnit, setIsOtherUnit] = useState(false);
  const [customUnit, setCustomUnit] = useState("");
  const [selectedTargetId, setSelectedTargetId] = useState<string>("new");
  const [sourceQuantity, setSourceQuantity] = useState("1");
  const [targetQuantity, setTargetQuantity] = useState("");

  const baseName = sourceProduct.name.split('(')[0].trim();
  
  // Show all products but keep suggested ones at top if needed
  const availableTargets = allProducts.filter(p => p.id !== sourceProduct.id);
  const suggestedTargets = availableTargets.filter(p => 
    p.name.toLowerCase().includes(baseName.toLowerCase())
  );
  const otherTargets = availableTargets.filter(p => 
    !p.name.toLowerCase().includes(baseName.toLowerCase())
  );

  // Auto-populate unit when target changes
  useEffect(() => {
    if (selectedTargetId === "new") {
      setTargetUnit("pack");
      setIsOtherUnit(false);
    } else {
      const target = allProducts.find(p => p.id === selectedTargetId);
      if (target) {
        setTargetUnit(target.unit);
        setIsOtherUnit(false);
      }
    }
  }, [selectedTargetId, allProducts]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const sQty = parseInt(sourceQuantity, 10);
    const tQty = parseInt(targetQuantity, 10);
    const finalUnit = isOtherUnit ? customUnit : targetUnit;

    const res = await convertProduct(
      sourceProduct.id,
      selectedTargetId === "new" ? null : selectedTargetId,
      {
        unit: finalUnit,
        quantity: tQty,
        sourceQuantity: sQty,
        name: selectedTargetId === "new" ? `${baseName} (${finalUnit})` : undefined,
      }
    );
    
    if (res.success) {
      setOpen(false);
      toast.success(`Converted ${sQty} ${sourceProduct.unit}(s) into ${tQty} ${finalUnit}s`);
      setLoading(false);
    } else {
      alert(res.error || "Failed to convert");
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="ghost" className="h-9 px-3 text-indigo-600 hover:bg-indigo-50 font-bold gap-2 rounded-xl">
          <Repeat className="h-4 w-4" />
          Convert
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-0 shadow-2xl bg-white/95 backdrop-blur-3xl overflow-hidden">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="p-2">
            <DialogTitle className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl text-white">
                <Repeat className="w-6 h-6" />
              </div>
              Convert Stock
            </DialogTitle>
            <DialogDescription className="font-semibold text-slate-500 mt-2">
              Transforming <span className="text-slate-900 font-extrabold">{sourceProduct.name}</span> into smaller units.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-6 px-2">
            {/* Step 1: How many pieces to convert from source */}
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                1. How many <span className="text-indigo-600">{sourceProduct.unit}s</span> will you convert?
              </Label>
              <Input
                type="number"
                min="1"
                required
                value={sourceQuantity}
                onChange={(e) => setSourceQuantity(e.target.value)}
                placeholder="e.g. 1"
                className="h-14 text-xl rounded-2xl border-black/[0.05] bg-slate-50/50 font-black focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="border-t border-slate-100 my-2" />

            {/* Step 2: Target Selection */}
            <div className="space-y-3">
              <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">2. Select Target Product</Label>
              <Select value={selectedTargetId} onValueChange={(val) => setSelectedTargetId(val || "new")}>
                <SelectTrigger className="h-14 rounded-2xl border-black/[0.05] bg-white font-bold shadow-sm">
                  <SelectValue placeholder="Select target product" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-0 shadow-2xl max-h-[300px]">
                  <SelectItem value="new" className="font-bold text-indigo-600 py-3">
                    + Create New Product for Conversion
                  </SelectItem>
                  {suggestedTargets.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">Suggested</div>
                      {suggestedTargets.map(t => (
                        <SelectItem key={t.id} value={t.id} className="font-semibold py-3 italic">
                          {t.name} ({t.unit})
                        </SelectItem>
                      ))}
                    </>
                  )}
                  {otherTargets.length > 0 && (
                    <>
                      <div className="px-2 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50">All Products</div>
                      {otherTargets.map(t => (
                        <SelectItem key={t.id} value={t.id} className="font-medium py-3">
                          {t.name} ({t.unit})
                        </SelectItem>
                      ))}
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Step 3: Quantity Gained */}
            <div className="space-y-4">
               <div className="flex justify-between items-center">
                  <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">
                    3. Total Quantity Gained
                  </Label>
                  <div className="text-[10px] font-black text-indigo-500 uppercase">
                    In {isOtherUnit ? customUnit : targetUnit}s
                  </div>
               </div>

               <div className="grid grid-cols-12 gap-3 items-center">
                 <div className="col-span-8 relative">
                   <Input
                    type="number"
                    min="1"
                    required
                    value={targetQuantity}
                    onChange={(e) => setTargetQuantity(e.target.value)}
                    placeholder="e.g. 50"
                    className="h-14 pl-6 text-xl rounded-2xl border-black/[0.05] bg-slate-50/50 font-black focus:bg-white transition-all shadow-inner"
                   />
                 </div>
                 <div className="col-span-4">
                    {selectedTargetId === "new" ? (
                      <Select value={isOtherUnit ? "other" : targetUnit} onValueChange={(val) => {
                        if (val === "other") {
                          setIsOtherUnit(true);
                        } else if (val) {
                          setIsOtherUnit(false);
                          setTargetUnit(val);
                        }
                      }}>
                        <SelectTrigger className="h-14 rounded-2xl border-black/[0.05] bg-white font-bold">
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-1 shadow-xl">
                          <SelectItem value="pack" className="font-bold text-xs uppercase">Pack</SelectItem>
                          <SelectItem value="bottle" className="font-bold text-xs uppercase">Bottle</SelectItem>
                          <SelectItem value="sachet" className="font-bold text-xs uppercase">Sachet</SelectItem>
                          <SelectItem value="other" className="font-bold text-indigo-600 text-xs uppercase">Others...</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-14 flex items-center px-4 bg-slate-100/50 rounded-2xl font-black text-xs text-slate-400 uppercase tracking-widest border border-black/5 ring-1 ring-white">
                        {targetUnit}
                      </div>
                    )}
                 </div>
               </div>

               {isOtherUnit && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                    <Label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Custom Unit Name</Label>
                    <Input
                      placeholder="e.g. Gallon"
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      required={isOtherUnit}
                      className="h-12 rounded-xl border-black/[0.05] bg-white font-bold"
                    />
                  </div>
                )}
            </div>

            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 flex gap-3 items-start">
               <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
               <p className="text-[11px] text-indigo-700 font-bold leading-relaxed">
                  Summary: Converting <span className="font-black underline">{sourceQuantity || 0} {sourceProduct.unit}(s)</span> will remove them from stock and add <span className="font-black underline">{targetQuantity || 0} {isOtherUnit ? customUnit : targetUnit}(s)</span> to the target product.
               </p>
            </div>
          </div>

          <DialogFooter className="bg-slate-50/50 p-6 -mx-6 -mb-6 border-t border-slate-100">
            <Button type="submit" disabled={loading} className="w-full rounded-2xl h-14 font-black shadow-xl shadow-indigo-500/20 gap-2 text-lg bg-indigo-600 hover:bg-indigo-700 transition-all active:scale-[0.98]">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                <>
                  <Repeat className="w-5 h-5" />
                  Convert Now
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
