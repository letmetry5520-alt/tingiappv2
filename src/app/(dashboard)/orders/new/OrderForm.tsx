"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createOrder } from "@/app/actions/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, ShoppingCart, Trash2, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { InvoiceModal } from "@/components/InvoiceModal";
import { getOrderById } from "@/app/actions/order";

type Customer = { id: string; storeName: string; ownerName: string; address: string };
type Product = { id: string; name: string; unit: string; price: number; stock: number };
type PackageObj = { id: string; name: string; price: number };

type CartItem = {
  id: string; // product ID or package ID
  type: "product" | "package";
  quantity: number;
  name: string;
  price: number;
  maxStock?: number;
};

export function OrderForm({ 
  customers, products, packages, defaultCustomerId 
}: { 
  customers: Customer[], products: Product[], packages: PackageObj[], defaultCustomerId?: string 
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [customerId, setCustomerId] = useState(defaultCustomerId || "");
  const [paymentType, setPaymentType] = useState<"Cash" | "Utang">("Cash");
  const [cart, setCart] = useState<CartItem[]>([]);

  const [lastCreatedOrder, setLastCreatedOrder] = useState<any>(null);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");

  const addProduct = () => {
    if (!selectedProductId) return;
    const p = products.find(x => x.id === selectedProductId);
    if (!p) return;
    
    const existing = cart.find(c => c.id === p.id && c.type === "product");
    if (existing) {
      if (existing.quantity >= p.stock) return alert(`Only ${p.stock} in stock`);
      setCart(cart.map(c => c.id === p.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { id: p.id, type: "product", name: p.name, price: p.price, quantity: 1, maxStock: p.stock }]);
    }
    setSelectedProductId("");
  };

  const addPackage = () => {
    if (!selectedPackageId) return;
    const pkg = packages.find(x => x.id === selectedPackageId);
    if (!pkg) return;
    
    const existing = cart.find(c => c.id === pkg.id && c.type === "package");
    if (existing) {
      setCart(cart.map(c => c.id === pkg.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { id: pkg.id, type: "package", name: pkg.name, price: pkg.price, quantity: 1 }]);
    }
    setSelectedPackageId("");
  };

  const updateQuantity = (id: string, type: "product"|"package", qty: number) => {
    setCart(cart.map(c => c.id === id && c.type === type ? { ...c, quantity: Math.max(1, qty) } : c));
  };

  const removeCartItem = (id: string, type: "product"|"package") => {
    setCart(cart.filter(c => !(c.id === id && c.type === type)));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) return alert("Select a customer");
    if (cart.length === 0) return alert("Cart is empty");

    setLoading(true);
    const orderItems = cart.map(({ id, type, quantity }) => ({ id, type, quantity }));
    const res = await createOrder(customerId, paymentType, orderItems);
    
    setLoading(false);
    if (res.success && "orderId" in res) {
      const fullOrder = await getOrderById(res.orderId);
      if (fullOrder) {
        setLastCreatedOrder(fullOrder);
        setIsInvoiceModalOpen(true);
        setCart([]); // Clear cart
      } else {
        router.push("/dashboard");
      }
    } else {
      alert(`Error: ${"error" in res ? res.error : "Unknown error"}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Fast Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Add Product (Retail)</Label>
                  <div className="flex gap-2">
                    <Select value={selectedProductId} onValueChange={(val) => setSelectedProductId(val || "")}>
                      <SelectTrigger><SelectValue placeholder="Search product..." /></SelectTrigger>
                      <SelectContent>
                        {products.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} - ₱{p.price} ({p.stock} left)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addProduct} disabled={!selectedProductId}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Add Package (Bundle)</Label>
                  <div className="flex gap-2">
                    <Select value={selectedPackageId} onValueChange={(val) => setSelectedPackageId(val || "")}>
                      <SelectTrigger><SelectValue placeholder="Search package..." /></SelectTrigger>
                      <SelectContent>
                        {packages.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name} - ₱{p.price}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" onClick={addPackage} disabled={!selectedPackageId}><Plus className="h-4 w-4" /></Button>
                  </div>
                </div>
              </div>

              {cart.length > 0 && (
                <div className="mt-6 border rounded-lg p-4 bg-muted/10 space-y-3">
                  <Label>Current Cart</Label>
                  {cart.map((item, idx) => (
                    <div key={`${item.type}-${item.id}`} className="flex items-center justify-between bg-card border px-3 py-2 rounded-md shadow-sm">
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{item.name}</span>
                        <div className="flex gap-2 items-center text-xs text-muted-foreground mt-1">
                          <Badge variant="outline" className="text-[10px] uppercase font-mono">{item.type}</Badge>
                          <span>₱{item.price.toFixed(2)} ea</span>
                          {item.type === "product" && <span>(Stock: {item.maxStock})</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Input 
                          type="number" 
                          min="1" 
                          max={item.type === "product" ? item.maxStock : undefined}
                          className="w-20 h-8" 
                          value={item.quantity} 
                          onChange={(e) => updateQuantity(item.id, item.type, parseInt(e.target.value) || 1)}
                        />
                        <div className="text-sm font-bold w-16 text-right">
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeCartItem(item.id, item.type)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="flex justify-between items-center font-bold text-lg pt-4 border-t mt-4">
                    <span>Total Amount</span>
                    <span className="text-primary text-2xl">₱{totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <form onSubmit={onSubmit}>
              <CardHeader>
                <CardTitle>Order Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 flex flex-col items-start w-full">
                  <Label>Customer / Store *</Label>
                  <Select value={customerId} onValueChange={(val) => setCustomerId(val || "")} required>
                    <SelectTrigger className="w-full text-left">
                      <SelectValue placeholder="Select customer" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.storeName} <span className="text-muted-foreground text-xs">({c.ownerName})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      type="button" 
                      variant={paymentType === "Cash" ? "default" : "outline"} 
                      onClick={() => setPaymentType("Cash")}
                      className={`w-full ${paymentType === "Cash" ? "bg-green-600 hover:bg-green-700 text-white" : ""}`}
                    >
                      Cash
                    </Button>
                    <Button 
                      type="button" 
                      variant={paymentType === "Utang" ? "default" : "outline"}
                      onClick={() => setPaymentType("Utang")}
                      className={`w-full ${paymentType === "Utang" ? "bg-red-600 hover:bg-red-700 text-white" : ""}`}
                    >
                      Utang (Credit)
                    </Button>
                  </div>
                  {paymentType === "Utang" && (
                    <p className="text-xs text-muted-foreground mt-2">
                      * Utang orders specify a 7-day payment due date automatically.
                    </p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button 
                  type="submit" 
                  disabled={loading || cart.length === 0 || !customerId} 
                  className="w-full h-12 text-lg font-bold"
                >
                  {loading ? "Processing..." : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Complete Order
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>

      <InvoiceModal 
        order={lastCreatedOrder} 
        isOpen={isInvoiceModalOpen} 
        onOpenChange={(open) => {
          setIsInvoiceModalOpen(open);
          if (!open) router.push("/orders");
        }} 
      />
    </div>
  );
}
