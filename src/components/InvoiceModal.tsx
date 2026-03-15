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
  const receiptRef = useRef<HTMLDivElement>(null);

  if (!order) return null;

  const handlePrint = () => {
    const printContent = receiptRef.current;
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
    if (!receiptRef.current) return;

    try {
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3, // Very high definition
        backgroundColor: "#ffffff",
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `receipt-${order.id.slice(-8)}.png`, { type: "image/png" });

        // Check if sharing is supported on this device
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: `Receipt #${order.id.slice(-8).toUpperCase()}`,
            });
          } catch (shareErr) {
            console.error("Shared failed", shareErr);
            triggerDownload(blob);
          }
        } else {
          triggerDownload(blob);
        }
      }, "image/png");
    } catch (err) {
      console.error("Image capture failed:", err);
      alert("Could not generate image receipt. Try printing instead.");
    }
  };

  const triggerDownload = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `receipt-${order.id.slice(-8)}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert("Receipt image saved! You can now send it manually via Messenger or Gallery.");
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
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-0 bg-transparent shadow-none font-mono">
        <div 
          ref={receiptRef}
          className="bg-white p-8 text-black border-[3px] border-black m-2"
        >
          <div className="text-center space-y-1 mb-6">
            <h2 className="text-xl font-black uppercase tracking-tight">MrTingi Online Supplier</h2>
            <div className="text-[12px] font-bold">Tel (0965-445-9305)</div>
            <div className="text-[12px] font-bold">Marilao Bulacan</div>
          </div>

          <div className="text-[12px] space-y-2 border-t-2 border-b-2 border-black border-dashed py-4 mb-4">
            <div className="flex justify-between">
              <span>Receipt #:</span>
              <span className="font-bold">{order.id.slice(-8).toUpperCase()}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span className="font-bold">{format(new Date(order.createdAt), "yyyy-MM-dd HH:mm")}</span>
            </div>
            <div className="pt-1 flex flex-col">
              <span className="text-[10px] text-muted-foreground uppercase font-black tracking-widest">Customer:</span>
              <span className="text-lg font-black leading-tight">{order.customer?.storeName}</span>
            </div>
          </div>

          <div className="text-[13px] leading-tight">
            <div className="grid grid-cols-[35px_1fr_90px] font-black border-b-2 border-black pb-2 mb-2 uppercase text-[11px]">
              <span>Qty</span>
              <span>Description</span>
              <span className="text-right">Amount</span>
            </div>
            <div className="space-y-3 py-2 min-h-[100px]">
              {order.items.map((item: any, i: number) => (
                <div key={i} className="grid grid-cols-[35px_1fr_90px] gap-2 items-start">
                  <span className="font-bold">{item.quantity}</span>
                  <span className="font-bold uppercase leading-[1.3] break-words">{item.name}</span>
                  <span className="text-right font-black">₱{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t-2 border-black border-dashed mt-4 pt-4 flex justify-end items-center gap-3">
              <span className="text-xl font-black">TOTAL |</span>
              <span className="text-2xl font-black">₱{order.total.toFixed(2)}</span>
            </div>
          </div>

          <div className="text-[10px] pt-8 space-y-1 font-bold">
            <div>Status: Delivered</div>
            <div>By: Tingiapp</div>
          </div>
        </div>

        <DialogFooter className="p-4 flex flex-col gap-2 sm:flex-row bg-white/80 backdrop-blur pb-6 px-6">
          <Button 
            onClick={handleShare}
            className="flex-1 rounded-xl h-12 font-black uppercase text-xs tracking-widest gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30"
          >
            <Share2 className="h-4 w-4" />
            Share Image
          </Button>
          <Button 
            onClick={handlePrint}
            variant="outline"
            className="flex-1 rounded-xl h-12 font-black uppercase text-xs tracking-widest gap-2 border-2 border-black bg-white hover:bg-slate-50"
          >
            <Printer className="h-4 w-4" />
            Print Thermal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
