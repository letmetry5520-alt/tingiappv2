"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomer } from "@/app/actions/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await createCustomer(formData);
    
    setLoading(false);
    if (res.success) {
      router.push("/customers");
    } else {
      alert("Failed to create customer");
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Customer</h1>
          <p className="text-muted-foreground">Add a new sari-sari store to your route.</p>
        </div>
      </div>

      <Card>
        <form onSubmit={onSubmit}>
          <CardHeader>
            <CardTitle>Store Details</CardTitle>
            <CardDescription>Enter the basic information and location.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName">Store Name *</Label>
                <Input id="storeName" name="storeName" required placeholder="Mang Juan Store" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name *</Label>
                <Input id="ownerName" name="ownerName" required placeholder="Juan Dela Cruz" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" name="phone" required placeholder="0917-123-4567" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expectedOrderCycle">Order Cycle</Label>
                <Select name="expectedOrderCycle" defaultValue="Weekly">
                  <SelectTrigger id="expectedOrderCycle">
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Daily">Daily</SelectItem>
                    <SelectItem value="Weekly">Weekly</SelectItem>
                    <SelectItem value="Biweekly">Biweekly</SelectItem>
                    <SelectItem value="Irregular">Irregular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Input id="address" name="address" required placeholder="123 Mabini St, Brgy 1, City" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zoneName">Zone / Area</Label>
                <Input id="zoneName" name="zoneName" placeholder="Zone A" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="routeDay">Route Day</Label>
                <Select name="routeDay" defaultValue="Monday">
                  <SelectTrigger id="routeDay">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Monday">Monday</SelectItem>
                    <SelectItem value="Tuesday">Tuesday</SelectItem>
                    <SelectItem value="Wednesday">Wednesday</SelectItem>
                    <SelectItem value="Thursday">Thursday</SelectItem>
                    <SelectItem value="Friday">Friday</SelectItem>
                    <SelectItem value="Saturday">Saturday</SelectItem>
                    <SelectItem value="Sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude (GPS)</Label>
                <Input id="latitude" name="latitude" type="number" step="any" placeholder="14.5995" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude (GPS)</Label>
                <Input id="longitude" name="longitude" type="number" step="any" placeholder="120.9842" />
              </div>
            </div>

            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                📸 Store Visuals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image">Profile Photo URL</Label>
                  <Input id="image" name="image" placeholder="https://example.com/photo.jpg" />
                  <p className="text-[10px] text-muted-foreground">Main avatar for the store profile.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gallery">Gallery Images (URLs)</Label>
                  <Input name="gallery" placeholder="Image URL 1" className="mb-2" />
                  <Input name="gallery" placeholder="Image URL 2" className="mb-2" />
                  <Input name="gallery" placeholder="Image URL 3" />
                  <p className="text-[10px] text-muted-foreground">Multiple store photos for the showcase.</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 border-t pt-4">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" name="notes" placeholder="e.g. Needs to call before arriving" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-2 border-t pt-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/customers">Cancel</Link>
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Customer"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
