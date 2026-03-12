"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateProduct } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  category: string;
  unit: string;
  cost: number;
  price: number;
  stock: number;
  minStock: number;
};

export function EditProductForm({ product }: { product: Product }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isOtherUnit, setIsOtherUnit] = useState(!["bottle", "sachet", "tray", "pack", "piece", "case", "bag", "box", "container", "sack"].includes(product.unit));
  const [customUnit, setCustomUnit] = useState(!["bottle", "sachet", "tray", "pack", "piece", "case", "bag", "box", "container", "sack"].includes(product.unit) ? product.unit : "");
  const [unit, setUnit] = useState(product.unit);

  const margin = product.price > 0
    ? ((product.price - product.cost) / product.price * 100).toFixed(1)
    : "0";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("unit", isOtherUnit ? customUnit : unit);
    const res = await updateProduct(product.id, formData);
    setLoading(false);
    if (res.success) {
      router.push("/inventory");
    } else {
      alert("Failed to update product");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 bg-white/40 border border-white/60 backdrop-blur-3xl rounded-[2rem] shadow-xl ring-1 ring-black/5">
        <Button variant="ghost" size="icon" asChild className="rounded-xl h-10 w-10">
          <Link href="/inventory">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 truncate">{product.name}</h1>
          <p className="text-sm text-muted-foreground font-semibold mt-0.5">Edit product details below</p>
        </div>
        <Badge variant="outline" className={cn(
          "rounded-xl px-3 py-1.5 font-black text-[10px] uppercase tracking-widest border-0",
          product.stock <= product.minStock ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-700"
        )}>
          {product.stock} in stock
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Sell Price", value: `₱${Number(product.price).toFixed(2)}`, colorClass: "text-emerald-600" },
          { label: "Cost Price", value: `₱${Number(product.cost).toFixed(2)}`, colorClass: "text-slate-700" },
          { label: "Margin", value: `${margin}%`, colorClass: "text-indigo-600" },
        ].map((s) => (
          <div key={s.label} className="p-4 bg-white/60 backdrop-blur-xl rounded-[1.5rem] border border-white/60 shadow-sm text-center">
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{s.label}</div>
            <div className={`text-xl font-black tracking-tight ${s.colorClass}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Form */}
      <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2.5rem] overflow-hidden">
        <form onSubmit={onSubmit}>
          <CardHeader className="bg-slate-50/30 border-b border-black/[0.03] px-8 pt-8 pb-6">
            <CardTitle className="text-xl font-bold">Product Details</CardTitle>
            <CardDescription className="font-semibold text-xs">Update the fields below and save.</CardDescription>
          </CardHeader>

          <CardContent className="px-8 pt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Product Name *</Label>
                <Input
                  name="name"
                  required
                  defaultValue={product.name}
                  className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Category *</Label>
                <Input
                  name="category"
                  required
                  defaultValue={product.category}
                  className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Unit Type *</Label>
                  <Select 
                    value={isOtherUnit ? "other" : unit} 
                    onValueChange={(val) => { 
                      if (val === "other") {
                        setIsOtherUnit(true);
                      } else if (val) {
                        setIsOtherUnit(false);
                        setUnit(val); 
                      }
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-0 shadow-2xl">
                      {["bottle", "sachet", "tray", "pack", "piece", "case", "bag", "box", "container", "sack"].map((u) => (
                        <SelectItem key={u} value={u} className="font-bold py-3">
                          {u.charAt(0).toUpperCase() + u.slice(1)}
                        </SelectItem>
                      ))}
                      <SelectItem value="other" className="font-bold text-indigo-600 py-3">Other...</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {isOtherUnit && (
                  <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Custom Unit Name *</Label>
                    <Input 
                      required 
                      placeholder="e.g. Gallon, Box" 
                      value={customUnit}
                      onChange={(e) => setCustomUnit(e.target.value)}
                      className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm"
                    />
                  </div>
                )}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Stock</Label>
                  <Input
                    name="stock"
                    type="number"
                    min="0"
                    required
                    defaultValue={product.stock}
                    className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Min Alert</Label>
                  <Input
                    name="minStock"
                    type="number"
                    min="0"
                    required
                    defaultValue={product.minStock}
                    className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Cost Price (₱) *</Label>
                <Input
                  name="cost"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={product.cost}
                  className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Selling Price (₱) *</Label>
                <Input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  defaultValue={product.price}
                  className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Adjustment Notes / Source</Label>
              <textarea
                name="notes"
                placeholder="Describe the reason for adjustment or source of stock..."
                className="w-full min-h-[100px] p-4 rounded-xl border border-black/[0.05] bg-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-sm"
              />
            </div>
          </CardContent>

          <CardFooter className="px-8 py-6 bg-slate-50/30 border-t border-black/[0.03] flex justify-end gap-3">
            <Button variant="outline" type="button" asChild className="rounded-2xl h-11 px-6 font-bold">
              <Link href="/inventory">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading} className="rounded-2xl h-11 px-8 font-black shadow-lg shadow-primary/20 gap-2">
              <Save className="h-4 w-4" />
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
