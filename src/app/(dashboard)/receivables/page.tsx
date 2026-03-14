import { PrismaClient } from "@prisma/client";
import { format, differenceInDays } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PaymentDialog } from "./PaymentDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Receipt, AlertCircle, CheckCircle2, Clock } from "lucide-react";

import { ReceivablesTable } from "./ReceivablesTable";

const prisma = new PrismaClient();

export default async function ReceivablesPage() {
  const unpaidOrders = await prisma.order.findMany({
    where: {
      paymentType: "Utang",
      status: { not: "Paid" }
    },
    include: {
      customer: true,
      payments: true,
    },
    orderBy: { dueDate: "asc" }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-white/40 border border-white/60 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl ring-1 ring-black/5 gap-6">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-primary/10 rounded-3xl text-primary shadow-inner">
             <Receipt className="h-8 w-8" />
           </div>
           <div>
             <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Receivables</h1>
             <p className="text-muted-foreground font-semibold mt-1">Monitor & collect outstanding utang accounts.</p>
           </div>
        </div>
        <div className="flex flex-col items-end">
           <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Global Debt Portfolio</div>
           <div className="text-3xl font-black text-rose-600 tracking-tighter">
             ₱{unpaidOrders.reduce((sum, o) => {
               const paid = o.payments.reduce((pSum, p) => pSum + p.amount, 0);
               return sum + (o.total - paid);
             }, 0).toFixed(2)}
           </div>
        </div>
      </div>

      <ReceivablesTable initialOrders={unpaidOrders} />
    </div>
  );
}
