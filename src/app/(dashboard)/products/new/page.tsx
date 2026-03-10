"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProduct } from "@/app/actions/inventory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await createProduct(formData);
    
    setLoading(false);
    if (res.success) {
      router.push("/inventory");
    } else {
      alert("Failed to create product");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/inventory">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Product</h1>
        </div>
      </div>

      <Card>
        <form onSubmit={onSubmit}>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" name="name" required placeholder="Cooking Oil" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <Input id="category" name="category" required placeholder="Grocery" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unit">Unit Type *</Label>
                <Select name="unit" defaultValue="bottle">
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bottle">Bottle</SelectItem>
                    <SelectItem value="sachet">Sachet</SelectItem>
                    <SelectItem value="tray">Tray</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input id="stock" name="stock" type="number" defaultValue="0" min="0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStock">Min Stock Alert</Label>
                  <Input id="minStock" name="minStock" type="number" defaultValue="10" min="0" required />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="cost">Cost Price (₱) *</Label>
                <Input id="cost" name="cost" type="number" step="0.01" required placeholder="0.00" className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Selling Price (₱) *</Label>
                <Input id="price" name="price" type="number" step="0.01" required placeholder="0.00" className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes / Source (Optional)</Label>
              <textarea
                id="notes"
                name="notes"
                placeholder="e.g. Initial stock from container of oil..."
                className="w-full min-h-[100px] p-4 rounded-xl border border-black/[0.05] bg-white font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none shadow-sm"
              />
            </div>

          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/inventory">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Product"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
