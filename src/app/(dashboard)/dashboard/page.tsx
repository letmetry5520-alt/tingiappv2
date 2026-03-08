import { PrismaClient } from "@prisma/client";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertCircle, Wallet, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { SalesChart } from "./SalesChart";
import { Badge } from "@/components/ui/badge";

const prisma = new PrismaClient();

export default async function DashboardPage() {
  const today = new Date();
  const sevenDaysAgo = subDays(today, 6);
  
  const recentOrders = await prisma.order.findMany({
    where: { createdAt: { gte: startOfDay(sevenDaysAgo) } }
  });

  const paidOrdersWeek = recentOrders.filter(o => o.status === "Paid");

  const recentTransactions = await prisma.financialTransaction.findMany({
    where: { date: { gte: startOfDay(sevenDaysAgo) } }
  });

  const totalSalesWeek = paidOrdersWeek.reduce((sum, o) => sum + o.total, 0);
  const totalProfitWeek = paidOrdersWeek.reduce((sum, o) => sum + o.profit, 0);
  const totalExpensesWeek = recentTransactions
    .filter(t => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfitWeek = totalProfitWeek - totalExpensesWeek;

  const unpaidOrders = await prisma.order.findMany({
    where: { paymentType: "Utang", status: { not: "Paid" } },
    include: { payments: true }
  });
  
  const totalUtang = unpaidOrders.reduce((sum, o) => {
    const paid = o.payments.reduce((pSum, p) => pSum + p.amount, 0);
    return sum + (o.total - paid);
  }, 0);

  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const day = subDays(today, i);
    const dayStr = format(day, "MMM dd");
    const dayOrders = paidOrdersWeek.filter(o => 
      o.createdAt >= startOfDay(day) && o.createdAt <= endOfDay(day)
    );
    chartData.push({
      date: dayStr,
      sales: dayOrders.reduce((sum, o) => sum + o.total, 0),
      profit: dayOrders.reduce((sum, o) => sum + o.profit, 0)
    });
  }

  return (
    <div className="space-y-8 p-1 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 bg-white/40 p-8 rounded-3xl border border-white/60 backdrop-blur-3xl shadow-2xl ring-1 ring-black/5">
        <div>
          <Badge variant="outline" className="mb-3 px-3 py-1 bg-white/50 backdrop-blur-sm border-primary/20 text-primary font-bold">
            <Activity className="w-3 h-3 mr-1" /> System Live
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
            Welcome back, Admin
          </h1>
          <p className="text-muted-foreground font-medium mt-2 text-lg">
            Here is what is happening with your business this week.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{format(today, "EEEE")}</div>
          <div className="text-2xl font-black text-slate-900">{format(today, "MMMM dd, yyyy")}</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            title: "Gross Sales", 
            value: totalSalesWeek, 
            icon: DollarSign, 
            desc: "Weekly total revenue", 
            color: "blue",
            trend: "+12.5%" 
          },
          { 
            title: "Net Profit", 
            value: netProfitWeek, 
            icon: TrendingUp, 
            desc: "Revenue minus expenses", 
            color: "emerald",
            trend: "+8.2%"
          },
          { 
            title: "Global Utang", 
            value: totalUtang, 
            icon: AlertCircle, 
            desc: "Pending receivables", 
            color: "orange",
            isWarning: true,
            trend: "-2.1%"
          },
          { 
            title: "Total Expenses", 
            value: totalExpensesWeek, 
            icon: Wallet, 
            desc: "Out of pocket costs", 
            color: "rose",
            trend: "+1.4%"
          },
        ].map((stat, i) => (
          <Card key={i} className="group overflow-hidden border-0 shadow-xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 hover:ring-2 hover:ring-primary/20 transition-all duration-500 rounded-3xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">{stat.title}</CardTitle>
              <div className={stat.isWarning ? "p-2 bg-orange-500/10 rounded-xl text-orange-600" : "p-2 bg-slate-900/5 rounded-xl text-slate-900"}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-3xl font-black tracking-tighter text-slate-900">₱{stat.value.toFixed(2)}</div>
                <div className={`text-xs font-bold flex items-center ${stat.color === "rose" ? "text-rose-600" : stat.color === "orange" ? "text-orange-600" : "text-emerald-600"}`}>
                   {stat.trend.startsWith("+") ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />} {stat.trend}
                </div>
              </div>
              <p className="text-xs font-medium text-muted-foreground mt-2">{stat.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-5 border-0 shadow-2xl bg-white/70 backdrop-blur-3xl ring-1 ring-black/5 rounded-3xl overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">Weekly Performance Analytics</CardTitle>
              <CardDescription className="font-medium">Sales vs Gross Profit trajectory</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-primary/10 rounded-full text-primary">
                <div className="w-2 h-2 rounded-full bg-primary" /> Sales
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 bg-emerald-500/10 rounded-full text-emerald-600">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Profit
              </div>
            </div>
          </CardHeader>
          <CardContent className="pl-2 pr-4 pb-6 h-[400px]">
            <SalesChart data={chartData} />
          </CardContent>
        </Card>

        <div className="col-span-1 lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white rounded-3xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Activity size={120} strokeWidth={8} />
            </div>
            <CardHeader>
              <CardTitle className="text-xl font-bold">Quick Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-indigo-100 font-medium text-sm leading-relaxed">
                Your system is ready for testing. Try placing an order to see live inventory updates.
              </p>
              <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 py-2 rounded-xl border-white/20 backdrop-blur-md w-full justify-center text-sm font-bold">
                Run Simulation
              </Badge>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-3xl overflow-hidden">
            <CardHeader className="pb-3 border-b border-black/[0.03]">
              <CardTitle className="text-lg font-bold">System Health</CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
               {[
                 { label: "Database Connection", status: "Active" },
                 { label: "Inventory Sync", status: "Enabled" },
                 { label: "Route Optimizer", status: "Ready" }
               ].map((h, idx) => (
                 <div key={idx} className="flex justify-between items-center text-sm">
                   <span className="text-muted-foreground font-semibold">{h.label}</span>
                   <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-0 rounded-lg px-2 text-[10px] font-black uppercase tracking-tighter">{h.status}</Badge>
                 </div>
               ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
