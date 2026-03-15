"use client";

import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Printer, Share2, Receipt, ShoppingBag, User, Calendar, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

type InvoiceModalProps = {
  order: any;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  showTrigger?: boolean;
};

export function InvoiceModal({ order, isOpen, onOpenChange, showTrigger = false }: InvoiceModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @page { size: auto; margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 58mm; 
              padding: 2mm; 
              margin: 0; 
              font-size: 11px;
              color: #000;
              background: #fff;
            }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .mt-1 { margin-top: 4px; }
            .mb-1 { margin-bottom: 4px; }
            .divider { border-bottom: 1px dashed #000; margin: 4px 0; }
            
            table { width: 100%; border-collapse: collapse; table-layout: fixed; }
            th { text-align: left; font-size: 10px; border-bottom: 1px solid #000; padding-bottom: 2px; }
            td { padding: 4px 0; word-wrap: break-word; vertical-align: top; }
            .col-qty { width: 13%; }
            .col-desc { width: 52%; }
            .col-amt { width: 35%; text-align: right; }
            
            .total-section { text-align: right; font-weight: bold; font-size: 12px; margin-top: 8px; }
            .footer { margin-top: 15px; font-size: 10px; text-align: center; border-top: 1px dashed #000; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 14px;">MrTingi Online Supplier</div>
          <div class="center">Tel (0965-445-9305)</div>
          <div class="center">Marilao Bulacan</div>
          <div class="mt-1">
            Receipt #: ${order.id.slice(-8).toUpperCase()}
          </div>
          <div>
            Date: ${format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}
          </div>

          <div class="mt-1">
            Customer: <span class="bold">${order.customer?.storeName || "Guest"}</span>
          </div>

          <div class="divider mt-1"></div>
          <table>
            <thead>
              <tr>
                <th class="col-qty">Qty</th>
                <th class="col-desc">Item Description</th>
                <th class="col-amt">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map((item: any) => `
                <tr>
                  <td class="col-qty">${item.quantity}</td>
                  <td class="col-desc">${item.name}</td>
                  <td class="col-amt">₱${(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="divider"></div>
          
          <div class="total-section">
            Total | ₱${order.total.toFixed(2)}
          </div>

          <div class="mt-1" style="font-size: 10px;">
            Status: ${order.status === "Paid" ? "Delivered / Paid" : "Delivered / Pending"}
          </div>

          <div class="footer">
            <p>*** THANK YOU! ***</p>
            <p>Printed via Tingiapp</p>
          </div>
          
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleShare = async () => {
    const text = `
MrTingi Online Supplier
Tel (0965-445-9305)
Marilao Bulacan
Receipt #: ${order.id.slice(-8).toUpperCase()}
Date: ${format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}

Customer: ${order.customer?.storeName || "Guest"}
------------------------------------
Qty | Item Description | Amount |
------------------------------------
${order.items.map((item: any) => `${item.quantity.toString().padEnd(3)} | ${item.name.padEnd(16).slice(0, 16)} | ₱${(item.price * item.quantity).toFixed(0).padStart(6)} |`).join('\n')}
------------------------------------
               Total | ₱${order.total.toFixed(2)} |

Status: Delivered
By: Tingiapp
    `.trim();

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Order Receipt',
          text: text,
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      await navigator.clipboard.writeText(text);
      alert("Plain text receipt copied to clipboard! You can now paste it in Messenger.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      {showTrigger && (
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:bg-slate-100 rounded-lg">
            <Receipt className="h-4 w-4" />
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-2 border-black bg-white rounded-none shadow-none font-mono text-black">
        <div className="p-6 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="text-lg font-bold uppercase tracking-tight">MrTingi Online Supplier</h2>
            <div className="text-xs">Tel (0965-445-9305)</div>
            <div className="text-xs">Marilao Bulacan</div>
          </div>

          <div className="text-xs space-y-1 border-t border-b border-black border-dashed py-3">
            <div>Receipt #: {order.id.slice(-8).toUpperCase()}</div>
            <div>Date: {format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}</div>
            <div className="pt-1">Customer: <span className="font-bold">{order.customer?.storeName}</span></div>
          </div>

          <div className="text-[11px] leading-tight">
            <div className="grid grid-cols-[30px_1fr_80px] font-bold border-b border-black pb-1 mb-1">
              <span>Qty</span>
              <span>Description</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="space-y-2 py-1">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="grid grid-cols-[30px_1fr_80px] gap-2">
                  <span>{item.quantity}</span>
                  <span className="break-words">{item.name}</span>
                  <span className="text-right font-bold">₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-black border-dashed mt-2 pt-2 text-right text-base font-bold">
              TOTAL | ₱{order.total.toFixed(2)}
            </div>
          </div>

          <div className="text-[10px] pt-2">
            <div>Status: Delivered</div>
            <div>By: Tingiapp</div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-50 border-t border-black flex flex-col gap-2 sm:flex-row">
          <Button 
            onClick={handleShare}
            variant="outline" 
            className="flex-1 rounded-none h-12 font-bold uppercase text-xs tracking-widest gap-2 border-black bg-white hover:bg-black hover:text-white transition-colors"
          >
            <Share2 className="h-4 w-4" />
            Share Plain Text
          </Button>
          <Button 
            onClick={handlePrint}
            className="flex-1 rounded-none h-12 font-bold uppercase text-xs tracking-widest gap-2 bg-black text-white hover:bg-slate-800 transition-colors"
          >
            <Printer className="h-4 w-4" />
            Print Thermal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
