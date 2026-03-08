"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCustomer } from "@/app/actions/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, User } from "lucide-react";
import Link from "next/link";

type Customer = {
  id: string;
  storeName: string;
  ownerName: string;
  phone: string;
  address: string;
  zoneName: string | null;
  routeDay: string | null;
  expectedOrderCycle: string | null;
  notes: string | null;
  latitude: number | null;
  longitude: number | null;
  image: string | null;
  gallery: string[];
};

export function EditCustomerForm({ customer }: { customer: Customer }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [routeDay, setRouteDay] = useState(customer.routeDay || "Monday");
  const [orderCycle, setOrderCycle] = useState(customer.expectedOrderCycle || "Weekly");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    formData.set("routeDay", routeDay);
    formData.set("expectedOrderCycle", orderCycle);
    const res = await updateCustomer(customer.id, formData);
    setLoading(false);
    if (res.success) {
      router.push(`/customers/${customer.id}`);
    } else {
      alert("Failed to update customer");
    }
  }

  // Pad gallery to always show 3 input slots
  const gallerySlots = [...(customer.gallery || []), "", "", ""].slice(0, 3);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 bg-white/40 border border-white/60 backdrop-blur-3xl rounded-[2rem] shadow-xl ring-1 ring-black/5">
        <Button variant="ghost" size="icon" asChild className="rounded-xl h-10 w-10">
          <Link href={`/customers/${customer.id}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        {customer.image ? (
          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-white shadow-md ring-1 ring-black/5">
            <img src={customer.image} alt={customer.storeName} className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="h-12 w-12 shrink-0 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
            <User className="h-6 w-6" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-black tracking-tight text-slate-900 truncate">{customer.storeName}</h1>
          <p className="text-sm text-muted-foreground font-semibold mt-0.5">Edit store profile</p>
        </div>
      </div>

      <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2.5rem] overflow-hidden">
        <form onSubmit={onSubmit}>
          <CardHeader className="bg-slate-50/30 border-b border-black/[0.03] px-8 pt-8 pb-6">
            <CardTitle className="text-xl font-bold">Store Details</CardTitle>
            <CardDescription className="font-semibold text-xs">Update the information and save.</CardDescription>
          </CardHeader>

          <CardContent className="px-8 pt-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Store Name *</Label>
                <Input name="storeName" required defaultValue={customer.storeName} className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Owner Name *</Label>
                <Input name="ownerName" required defaultValue={customer.ownerName} className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Phone *</Label>
                <Input name="phone" required defaultValue={customer.phone} className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Order Cycle</Label>
                <Select value={orderCycle} onValueChange={(v) => v && setOrderCycle(v)}>
                  <SelectTrigger className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-0 shadow-2xl">
                    {["Daily", "Weekly", "Biweekly", "Irregular"].map(v => (
                      <SelectItem key={v} value={v} className="font-bold py-3">{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Full Address *</Label>
              <Input name="address" required defaultValue={customer.address} className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Zone / Area</Label>
                <Input name="zoneName" defaultValue={customer.zoneName || ""} className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Delivery Day</Label>
                <Select value={routeDay} onValueChange={(v) => v && setRouteDay(v)}>
                  <SelectTrigger className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-0 shadow-2xl">
                    {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map(d => (
                      <SelectItem key={d} value={d} className="font-bold py-3">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Latitude (GPS)</Label>
                <Input name="latitude" type="number" step="any" defaultValue={customer.latitude ?? ""} className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Longitude (GPS)</Label>
                <Input name="longitude" type="number" step="any" defaultValue={customer.longitude ?? ""} className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm" />
              </div>
            </div>

            {/* Store Visuals */}
            <div className="space-y-4 pt-2 border-t border-black/[0.04]">
              <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">Store Visuals</h3>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Profile Photo URL</Label>
                <Input name="image" defaultValue={customer.image || ""} placeholder="https://example.com/photo.jpg" className="h-12 rounded-xl border-black/[0.05] bg-white font-bold shadow-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Gallery Images (URLs)</Label>
                {gallerySlots.map((url, i) => (
                  <Input key={i} name="gallery" defaultValue={url} placeholder={`Gallery image URL ${i + 1}`} className="h-12 rounded-xl border-black/[0.05] bg-white font-semibold shadow-sm mb-2" />
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Notes</Label>
              <Input name="notes" defaultValue={customer.notes || ""} placeholder="e.g. Call before arriving" className="h-12 rounded-xl border-black/[0.05] bg-white font-semibold shadow-sm" />
            </div>
          </CardContent>

          <CardFooter className="px-8 py-6 bg-slate-50/30 border-t border-black/[0.03] flex justify-end gap-3">
            <Button variant="outline" type="button" asChild className="rounded-2xl h-11 px-6 font-bold">
              <Link href={`/customers/${customer.id}`}>Cancel</Link>
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
