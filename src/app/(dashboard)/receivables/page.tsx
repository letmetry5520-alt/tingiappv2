import { PrismaClient } from "@prisma/client";
import { format, differenceInDays } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PaymentDialog } from "./PaymentDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Receipt, AlertCircle, CheckCircle2, Clock } from "lucide-react";

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

  const today = new Date();

  const calculateStatus = (dueDate: Date | null) => {
    if (!dueDate) return { color: "bg-slate-500", label: "No Due Date", icon: Clock };
    
    const daysDiff = differenceInDays(dueDate, today);
    
    if (daysDiff < 0) return { 
      color: "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200", 
      label: `${Math.abs(daysDiff)} Day(s) Overdue`,
      icon: AlertCircle 
    };
    if (daysDiff === 0) return { 
      color: "bg-orange-500 hover:bg-orange-600 text-white shadow-orange-200", 
      label: "Due Today",
      icon: Clock 
    };
    if (daysDiff <= 2) return { 
      color: "bg-amber-400 hover:bg-amber-500 text-amber-900 shadow-amber-200", 
      label: "Due Soon",
      icon: Clock 
    };
    return { 
      color: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200", 
      label: `Safe (${daysDiff} days left)`,
      icon: CheckCircle2 
    };
  };

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

      <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2rem] overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-0">
               <TableHead className="px-8 h-14 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Partner Store</TableHead>
               <TableHead className="h-14 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Transaction ID</TableHead>
               <TableHead className="h-14 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Lifeline / Due Date</TableHead>
               <TableHead className="h-14 font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Impact Amount</TableHead>
               <TableHead className="px-8 h-14 text-right font-bold uppercase tracking-tighter text-[11px] text-muted-foreground">Operations</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unpaidOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48 text-center text-muted-foreground font-medium">
                   <div className="flex flex-col items-center gap-3">
                      <CheckCircle2 className="h-10 w-10 text-emerald-500 opacity-30" />
                      All accounts are currently settled.
                   </div>
                </TableCell>
              </TableRow>
            ) : (
              unpaidOrders.map((order) => {
                const status = calculateStatus(order.dueDate);
                const alreadyPaid = order.payments.reduce((sum, p) => sum + p.amount, 0);
                const remaining = order.total - alreadyPaid;

                return (
                  <TableRow key={order.id} className="group hover:bg-black/[0.01] transition-all border-b border-black/[0.02] last:border-0 h-24">
                    <TableCell className="px-8">
                       <Link href={`/customers/${order.customerId}`} className="flex flex-col group/link">
                         <span className="font-bold text-slate-900 group-hover/link:text-primary transition-colors text-base">{order.customer.storeName}</span>
                         <span className="text-xs font-semibold text-muted-foreground/70">{order.customer.ownerName}</span>
                       </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-[10px] bg-slate-100/50 border-0 rounded-lg py-0 px-2">#{order.id.slice(-6).toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      {order.dueDate && (
                        <div className="flex flex-col gap-1.5 items-start">
                          <span className="text-xs font-black uppercase text-slate-800 tracking-tight">{format(order.dueDate, 'MMM dd, yyyy')}</span>
                          <Badge className={`${status.color} border-0 rounded-lg px-2 text-[9px] font-black uppercase tracking-tight shadow-sm flex items-center gap-1`}>
                             <status.icon className="h-2.5 w-2.5" />
                             {status.label}
                          </Badge>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                       <div className="flex flex-col">
                          <span className="font-black text-rose-600 text-lg tracking-tighter">₱{remaining.toFixed(2)}</span>
                          <span className="text-[10px] font-bold text-muted-foreground mt-0.5">Total: ₱{order.total.toFixed(2)}</span>
                       </div>
                    </TableCell>
                    <TableCell className="px-8 text-right">
                      <PaymentDialog order={{ id: order.id, total: order.total, payments: order.payments }} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
