"use client";

import { useState } from "react";
import { addExpense } from "@/app/actions/finance";
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
import { Plus } from "lucide-react";

export function ExpenseDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("Fuel");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    formData.set("category", category); // manual override from select
    
    const res = await addExpense(formData);
    setLoading(false);
    
    if (res.success) {
      setOpen(false);
    } else {
      alert("Failed to add expense");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Expense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Record Expense</DialogTitle>
            <DialogDescription>
              Track money spent on operations, fuel, restocking, etc.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fuel">Delivery Fuel</SelectItem>
                  <SelectItem value="Restock">Restocking Inventory</SelectItem>
                  <SelectItem value="Packaging">Packaging Supplies</SelectItem>
                  <SelectItem value="Salary">Salary / Wages</SelectItem>
                  <SelectItem value="Maintenance">Vehicle Maintenance</SelectItem>
                  <SelectItem value="Misc">Miscellaneous</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="description" placeholder="Gas at Shell Station" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₱)</Label>
                <Input id="amount" name="amount" type="number" step="0.01" min="0" placeholder="0.00" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save Expense"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
