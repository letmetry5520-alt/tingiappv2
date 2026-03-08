"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPackage } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type ProductType = { id: string; name: string; unit: string; price: number; cost: number };

export function PackageForm({ products }: { products: ProductType[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([]);
  const [selectedProduct, setSelectedProduct] = useState("");

  const addItem = () => {
    if (!selectedProduct) return;
    if (items.find(i => i.productId === selectedProduct)) return; // prevent dupes
    
    setItems([...items, { productId: selectedProduct, quantity: 1 }]);
    setSelectedProduct("");
  };

  const updateQuantity = (productId: string, qty: number) => {
    setItems(items.map(i => i.productId === productId ? { ...i, quantity: qty } : i));
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.productId !== productId));
  };

  const totalCost = items.reduce((sum, item) => {
    const p = products.find(p => p.id === item.productId);
    return sum + (p?.cost || 0) * item.quantity;
  }, 0);

  const calculateDefaultPrice = () => {
    const total = items.reduce((sum, item) => {
      const p = products.find(p => p.id === item.productId);
      return sum + (p?.price || 0) * item.quantity;
    }, 0);
    setPrice(total.toFixed(2));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return alert("Add at least one item");
    
    setLoading(true);
    const res = await createPackage(name, parseFloat(price), items);
    
    setLoading(false);
    if (res.success) {
      router.push("/inventory");
    } else {
      alert("Failed to create package");
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Package Builder</h1>
        </div>
      </div>

      <Card>
        <form onSubmit={onSubmit}>
          <CardHeader>
            <CardTitle>Bundle Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Package Name *</Label>
                <Input id="name" required placeholder="Super Saver Bundle" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="price">Selling Price (₱) *</Label>
                <div className="flex gap-2">
                  <Input id="price" type="number" step="0.01" required placeholder="0.00" value={price} onChange={e => setPrice(e.target.value)} />
                  <Button type="button" variant="outline" onClick={calculateDefaultPrice} title="Sum individual prices">Calc</Button>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4 bg-muted/20 space-y-4">
              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label>Add Products to Package</Label>
                  <Select value={selectedProduct} onValueChange={(val) => { if (val) setSelectedProduct(val); }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.unit}) - ₱{p.price}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="button" onClick={addItem} disabled={!selectedProduct}>
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>

              {items.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label>Included Items</Label>
                  <div className="space-y-2">
                    {items.map(item => {
                      const p = products.find(x => x.id === item.productId)!;
                      return (
                        <div key={item.productId} className="flex items-center justify-between bg-card border px-3 py-2 rounded-md shadow-sm">
                          <div className="flex items-center gap-2 flex-1">
                            <span className="font-medium text-sm">{p.name}</span>
                            <Badge variant="outline" className="text-[10px]">{p.unit}</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <Input 
                              type="number" 
                              min="1" 
                              className="w-20 h-8" 
                              value={item.quantity} 
                              onChange={(e) => updateQuantity(item.productId, parseInt(e.target.value) || 1)}
                            />
                            <div className="text-sm font-medium w-16 text-right">
                              ₱{(p.price * item.quantity).toFixed(2)}
                            </div>
                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeItem(p.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="flex justify-between items-center text-sm pt-4 border-t mt-4 text-muted-foreground">
                    <span>Total Cost (COGS): ₱{totalCost.toFixed(2)}</span>
                    <span className="font-medium text-foreground">
                      Profit Estimate: ₱{((parseFloat(price)||0) - totalCost).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/inventory">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Create Package"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
