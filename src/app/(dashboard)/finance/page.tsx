import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ExpenseDialog } from "./ExpenseDialog";
import { Badge } from "@/components/ui/badge";
import { PieChart, TrendingDown, Wallet, History, ArrowRight } from "lucide-react";

const prisma = new PrismaClient();

export default async function FinancePage() {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
    take: 50
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const categories: Record<string, number> = {};
  expenses.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-white/40 border border-white/60 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl ring-1 ring-black/5 gap-6">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-rose-500/10 rounded-3xl text-rose-600 shadow-inner">
             <Wallet className="h-8 w-8" />
           </div>
           <div>
             <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Financial Center</h1>
             <p className="text-muted-foreground font-semibold mt-1 text-sm lg:text-base">Track operating costs & maximize your net profit margins.</p>
           </div>
        </div>
        <div className="w-full md:w-auto">
          <ExpenseDialog />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2rem] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
             <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Capital Outflow</CardTitle>
             <TrendingDown className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
             <div className="text-3xl font-black text-rose-600 tracking-tighter">₱{totalExpenses.toFixed(2)}</div>
             <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50 mt-2 tracking-widest">Aggregated from {expenses.length} logs</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 flex flex-col gap-6">
           <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2.5rem] overflow-hidden">
             <CardHeader className="bg-slate-50/30 border-b border-black/[0.03] px-8 py-6 flex flex-row items-center justify-between">
                <div>
                   <CardTitle className="text-xl font-bold flex items-center gap-2">
                     <History className="h-5 w-5 opacity-40" /> Expense Ledger
                   </CardTitle>
                   <CardDescription className="font-semibold text-xs">A comprehensive history of your business costs.</CardDescription>
                </div>
                <Badge className="bg-slate-900 text-white border-0 font-black text-[10px] uppercase tracking-widest px-3 py-1 rounded-lg">LIVE FEED</Badge>
             </CardHeader>
             <CardContent className="p-0">
               <Table>
                 <TableHeader className="bg-slate-50/50">
                    <TableRow className="border-0">
                       <TableHead className="px-8 h-12 font-bold uppercase tracking-tighter text-[11px]">Timeline</TableHead>
                       <TableHead className="h-12 font-bold uppercase tracking-tighter text-[11px]">Category</TableHead>
                       <TableHead className="h-12 font-bold uppercase tracking-tighter text-[11px]">Nature of Expense</TableHead>
                       <TableHead className="px-8 h-12 text-right font-bold uppercase tracking-tighter text-[11px]">Value Impact</TableHead>
                    </TableRow>
                 </TableHeader>
                 <TableBody>
                   {expenses.length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={4} className="h-48 text-center text-muted-foreground font-medium">
                          <div className="flex flex-col items-center gap-3">
                             <Wallet className="h-10 w-10 opacity-10" />
                             No outgoing transactions found.
                          </div>
                       </TableCell>
                     </TableRow>
                   ) : (
                     expenses.map((e) => (
                       <TableRow key={e.id} className="group hover:bg-rose-50/[0.05] transition-all border-black/[0.02] h-20">
                         <TableCell className="px-8">
                            <span className="font-black text-xs text-slate-800 uppercase tracking-tighter">{format(e.date, "MMM dd, yyyy")}</span>
                         </TableCell>
                         <TableCell>
                            <Badge variant="outline" className="bg-indigo-50 border-indigo-100 text-indigo-700 font-black text-[9px] rounded-lg tracking-widest px-2 py-0.5">{e.category.toUpperCase()}</Badge>
                         </TableCell>
                         <TableCell className="text-sm font-semibold text-muted-foreground/80">{e.description}</TableCell>
                         <TableCell className="px-8 text-right font-black text-rose-600 text-base">
                           -₱{e.amount.toFixed(2)}
                         </TableCell>
                       </TableRow>
                     ))
                   )}
                 </TableBody>
               </Table>
             </CardContent>
           </Card>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
           <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2.5rem] overflow-hidden">
             <CardHeader className="px-8 pt-8">
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                   <PieChart className="h-5 w-5 text-indigo-500" /> Spending Profile
                </CardTitle>
                <CardDescription className="font-semibold text-xs text-muted-foreground">Allocation of your capital across categories.</CardDescription>
             </CardHeader>
             <CardContent className="px-8 pt-6 pb-8">
               <div className="space-y-4">
                 {Object.entries(categories)
                   .sort(([, a], [, b]) => b - a)
                   .map(([cat, amount], i) => (
                   <div key={cat} className="group flex items-center justify-between p-4 bg-slate-50/40 hover:bg-white rounded-2xl border border-black/[0.02] shadow-sm transition-all">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-0.5">{cat}</span>
                        <div className="flex items-center gap-2">
                           <div className={`w-3 h-3 rounded-md shadow-sm ${i === 0 ? "bg-indigo-500" : i === 1 ? "bg-fuchsia-100 dark:bg-fuchsia-500" : "bg-slate-300"}`} />
                           <span className="font-black text-slate-900">₱{amount.toFixed(2)}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/30 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                   </div>
                 ))}
               </div>
             </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
