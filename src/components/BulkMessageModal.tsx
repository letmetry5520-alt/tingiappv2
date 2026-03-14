"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MessageSquare, Facebook, Users, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Customer {
  id: string;
  storeName: string;
  ownerName: string;
  phone?: string;
  facebook?: string;
  orders?: any[];
  isBanned?: boolean;
}

export function BulkMessageModal({ customers, triggerVariant = "default" }: { customers: Customer[], triggerVariant?: "default" | "outline" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [creditFilter, setCreditFilter] = useState<"all" | "active" | "none">("all");
  const [contactFilter, setContactFilter] = useState<"all" | "sms" | "facebook">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "banned">("active");
  const [message, setMessage] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const filtered = customers.filter(c => {
    const matchesSearch = 
      c.storeName.toLowerCase().includes(search.toLowerCase()) || 
      c.ownerName.toLowerCase().includes(search.toLowerCase());
    
    const hasCredit = c.orders && c.orders.length > 0;
    const matchesCredit = 
      creditFilter === "all" || 
      (creditFilter === "active" && hasCredit) || 
      (creditFilter === "none" && !hasCredit);

    const matchesContact = 
      contactFilter === "all" || 
      (contactFilter === "sms" && c.phone) || 
      (contactFilter === "facebook" && c.facebook);

    const matchesStatus = 
      statusFilter === "all" || 
      (statusFilter === "active" && !c.isBanned) || 
      (statusFilter === "banned" && c.isBanned);

    return matchesSearch && matchesCredit && matchesContact && matchesStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(c => c.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleSendSMS = () => {
    const selected = customers.filter(c => selectedIds.has(c.id));
    const numbers = selected.map(c => c.phone).filter(Boolean).join(",");
    if (numbers) {
      const url = `sms:${numbers}${message ? `?body=${encodeURIComponent(message)}` : ""}`;
      window.location.href = url;
    }
  };

  const handleSendFB = () => {
    const selected = customers.filter(c => selectedIds.has(c.id));
    selected.forEach(c => {
      if (c.facebook) {
        const baseUrl = c.facebook.startsWith('http') ? c.facebook : `https://m.me/${c.facebook.replace('@', '')}`;
        // Note: m.me doesn't reliably support pre-filled messages via URL parameters for security, 
        // but we can open the chat.
        window.open(baseUrl, '_blank');
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant={triggerVariant} className="h-10 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg transition-all hover:scale-105">
          <Users className="h-4 w-4" />
          Send to Many
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl">
        <DialogHeader className="p-6 bg-slate-900 text-white">
          <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            Universal Broadcaster
          </DialogTitle>
          <div className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Target & Dispatch Bulk Communications</div>
        </DialogHeader>

        <div className="p-6 space-y-6">
          {/* Filters Row */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search partners..."
                className="pl-9 bg-slate-100/50 border-0 h-10 rounded-xl ring-1 ring-black/5"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                {["all", "active", "none"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setCreditFilter(f as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      creditFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {f === "active" ? "Has Credit" : f === "none" ? "No Credit" : "All Credit"}
                  </button>
                ))}
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                {["all", "sms", "facebook"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setContactFilter(f as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      contactFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {f === "sms" ? "Has SMS" : f === "facebook" ? "Has FB" : "All Contacts"}
                  </button>
                ))}
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                {["active", "banned", "all"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f as any)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                      statusFilter === f ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"
                    )}
                  >
                    {f === "active" ? "Clean List" : f === "banned" ? "Banned" : "All Status"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* List Area */}
          <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            <div className="space-y-2">
              <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Target List ({filtered.length})
                </div>
                <button 
                  onClick={toggleSelectAll}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                >
                  {selectedIds.size === filtered.length ? "Deselect All" : "Select All Filtered"}
                </button>
              </div>
              {filtered.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => toggleSelect(c.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer group",
                    selectedIds.has(c.id) 
                      ? "bg-primary/5 border-primary/20 shadow-sm" 
                      : "bg-white border-transparent hover:border-slate-200"
                  )}
                >
                  <div className={cn(
                    "h-5 w-5 rounded-lg flex items-center justify-center border transition-all",
                    selectedIds.has(c.id) ? "bg-primary border-primary text-white" : "bg-white border-slate-200"
                  )}>
                    {selectedIds.has(c.id) && <Check className="h-3 w-3 bold" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-slate-900 uppercase tracking-tight italic">{c.storeName}</div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      {c.ownerName} • {c.phone || "No Phone"}
                      {c.isBanned && <span className="ml-2 text-rose-600 font-black">BANNED</span>}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {c.phone && <MessageSquare className="h-3 h-3 text-blue-400" />}
                    {c.facebook && <Facebook className="h-3 h-3 text-indigo-400" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Area */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Message Template (Optional)</label>
            <textarea
              className="w-full bg-slate-100/50 border-0 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all h-24 resize-none"
              placeholder="Type your broadcast message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2">
            <Badge className="bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1">
              {selectedIds.size} Selected
            </Badge>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={handleSendSMS}
              disabled={selectedIds.size === 0}
              className="flex-1 sm:flex-none h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              <MessageSquare className="h-4 w-4" />
              Dispatch SMS
            </Button>
            <Button 
              onClick={handleSendFB}
              disabled={selectedIds.size === 0}
              className="flex-1 sm:flex-none h-11 px-6 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
            >
              <Facebook className="h-4 w-4" />
              Open FB Chats
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
