import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FinanceDialog } from "./FinanceDialog";
import { Badge } from "@/components/ui/badge";
import { PieChart, TrendingDown, TrendingUp, Wallet, History, ArrowRight, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const prisma = new PrismaClient();

export default async function FinancePage() {
  const transactions = await prisma.financialTransaction.findMany({
    orderBy: { date: "desc" },
    take: 50
  });

  const totalExpenses = transactions
    .filter(t => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter(t => t.type === "Income")
    .reduce((sum, t) => sum + t.amount, 0);

  const netFlow = totalIncome - totalExpenses;

  const categories: Record<string, number> = {};
  transactions.forEach(t => {
    categories[t.category] = (categories[t.category] || 0) + (t.type === "Income" ? t.amount : -t.amount);
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center p-8 bg-white/40 border border-white/60 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl ring-1 ring-black/5 gap-6">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-primary/10 rounded-3xl text-primary shadow-inner">
             <Wallet className="h-8 w-8" />
           </div>
           <div>
             <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Financial Center</h1>
             <p className="text-muted-foreground font-semibold mt-1 text-sm lg:text-base">Monitor capital flows and optimize your operations.</p>
           </div>
        </div>
        <div className="w-full lg:w-auto">
          <FinanceDialog />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2rem] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
             <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Inflow</CardTitle>
             <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-black text-emerald-600 tracking-tighter">₱{totalIncome.toFixed(2)}</div>
             <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50 mt-2 tracking-widest">Revenue & Investments</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2rem] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
             <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Total Outflow</CardTitle>
             <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-black text-rose-600 tracking-tighter">₱{totalExpenses.toFixed(2)}</div>
             <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50 mt-2 tracking-widest">Operational Expenses</p>
          </CardContent>
        </Card>

        <Card className={cn(
            "border-0 shadow-xl backdrop-blur-2xl ring-1 ring-black/5 rounded-[2rem] overflow-hidden group",
            netFlow >= 0 ? "bg-emerald-50/50" : "bg-rose-50/50"
        )}>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
             <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Net Position</CardTitle>
             <History className="h-4 w-4 opacity-40" />
          </CardHeader>
          <CardContent>
             <div className={cn(
                 "text-3xl font-black tracking-tighter",
                 netFlow >= 0 ? "text-emerald-700" : "text-rose-700"
             )}>₱{netFlow.toFixed(2)}</div>
             <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50 mt-2 tracking-widest">Adjusted Balance Flow</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
        <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-50/30 border-b border-black/[0.03] px-8 py-6 flex flex-row items-center justify-between">
             <div>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <History className="h-5 w-5 opacity-40" /> Master Ledger
                </CardTitle>
                <CardDescription className="font-semibold text-xs">A unified timeline of all financial transactions.</CardDescription>
             </div>
             <Badge className="bg-slate-900 text-white border-0 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">SYNCHRONIZED</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50/50">
                 <TableRow className="border-0">
                    <TableHead className="px-8 h-12 font-bold uppercase tracking-tighter text-[11px]">Timeline</TableHead>
                    <TableHead className="h-12 font-bold uppercase tracking-tighter text-[11px]">Flow</TableHead>
                    <TableHead className="h-12 font-bold uppercase tracking-tighter text-[11px]">Category</TableHead>
                    <TableHead className="h-12 font-bold uppercase tracking-tighter text-[11px]">Reference Memo</TableHead>
                    <TableHead className="px-8 h-12 text-right font-bold uppercase tracking-tighter text-[11px]">Value Impact</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-48 text-center text-muted-foreground font-medium">
                       <div className="flex flex-col items-center gap-3">
                          <Wallet className="h-10 w-10 opacity-10" />
                          No transactions found.
                       </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((t) => (
                    <TableRow key={t.id} className="group hover:bg-black/[0.01] transition-all border-black/[0.02] h-20">
                      <TableCell className="px-8">
                         <span className="font-black text-xs text-slate-800 uppercase tracking-tighter">{format(t.date, "MMM dd, yyyy")}</span>
                      </TableCell>
                      <TableCell>
                         {t.type === "Income" ? (
                           <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-tighter">
                             <ArrowUpCircle className="h-4 w-4" /> Income
                           </div>
                         ) : (
                           <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-tighter">
                             <ArrowDownCircle className="h-4 w-4" /> Expense
                           </div>
                         )}
                      </TableCell>
                      <TableCell>
                         <Badge variant="outline" className={cn(
                             "font-black text-[9px] rounded-lg tracking-widest px-2 py-0.5 border-0 uppercase",
                             t.type === "Income" ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"
                         )}>
                           {t.category}
                         </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-muted-foreground/80">{t.description}</TableCell>
                      <TableCell className={cn(
                          "px-8 text-right font-black text-base",
                          t.type === "Income" ? "text-emerald-600" : "text-rose-600"
                      )}>
                        {t.type === "Income" ? "+" : "-"}₱{t.amount.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
