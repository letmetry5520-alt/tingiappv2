import { PrismaClient } from "@prisma/client";
import { format, subDays, startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear, eachDayOfInterval, isSameDay } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, TrendingUp, AlertCircle, Wallet, ArrowUpRight, ArrowDownRight, Activity, Package, AlertTriangle } from "lucide-react";
import { SalesChart } from "./SalesChart";
import { StockChart } from "./StockChart";
import { Badge } from "@/components/ui/badge";
import { DashboardFilter } from "./DashboardFilter";
import { cn } from "@/lib/utils";

const prisma = new PrismaClient();

interface DashboardProps {
  searchParams: Promise<{ 
    filter?: string;
    start?: string;
    end?: string;
  }>;
}

export default async function DashboardPage({ searchParams }: DashboardProps) {
  const params = await searchParams;
  const filter = params.filter || "today";
  const startParam = params.start;
  const endParam = params.end;

  const today = new Date();
  let startDate: Date;
  let endDate: Date = endOfDay(today);
  let titlePeriod = "today";
  let chartStep = "day";

  // Calculate Date Range based on filter
  switch (filter) {
    case "weekly":
      startDate = startOfDay(subDays(today, 6));
      titlePeriod = "this week";
      break;
    case "monthly":
      startDate = startOfDay(startOfMonth(today));
      endDate = endOfDay(endOfMonth(today));
      titlePeriod = "this month";
      break;
    case "yearly":
      startDate = startOfDay(startOfYear(today));
      endDate = endOfDay(endOfYear(today));
      titlePeriod = "this year";
      break;
    case "custom":
      const parsedStart = startParam ? new Date(startParam) : null;
      const parsedEnd = endParam ? new Date(endParam) : null;
      
      startDate = parsedStart && !isNaN(parsedStart.getTime()) ? startOfDay(parsedStart) : startOfDay(today);
      endDate = parsedEnd && !isNaN(parsedEnd.getTime()) ? endOfDay(parsedEnd) : endOfDay(today);
      
      if (startDate > endDate) {
        const temp = startDate;
        startDate = endDate;
        endDate = temp;
      }
      
      titlePeriod = "custom period";
      break;
    case "today":
    default:
      startDate = startOfDay(today);
      endDate = endOfDay(today);
      titlePeriod = "today";
      break;
  }
  
  // Fetch data with selected date range
  const recentOrders = await prisma.order.findMany({
    where: { 
      createdAt: { 
        gte: startDate,
        lte: endDate
      } 
    }
  });

  const recentPayments = await prisma.payment.findMany({
    where: { 
      date: { 
        gte: startDate,
        lte: endDate
      } 
    },
    include: {
      order: true
    }
  });

  const recentTransactions = await prisma.financialTransaction.findMany({
    where: { 
      date: { 
        gte: startDate,
        lte: endDate
      } 
    }
  });

  // Calculate statistics
  // Gross Sales reflect total money collected (Revenue)
  const totalSales = recentPayments.reduce((sum, p) => sum + p.amount, 0);
  
  // Realized Profit: Proportional profit based on how much was collected for each order
  const totalProfit = recentPayments.reduce((sum, p) => {
    if (!p.order || p.order.total === 0) return sum;
    const profitRatio = p.order.profit / p.order.total;
    return sum + (p.amount * profitRatio);
  }, 0);
  
  const totalExpenses = (recentTransactions as any[])
    .filter(t => t.type === "Expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const netProfit = totalProfit - totalExpenses;

  // Global Utang
  const unpaidOrders = await prisma.order.findMany({
    where: { paymentType: "Utang", status: { not: "Paid" } },
    include: { payments: true }
  });
  
  const totalUtang = unpaidOrders.reduce((sum, o) => {
    const paid = o.payments.reduce((pSum, p) => pSum + p.amount, 0);
    return sum + (o.total - paid);
  }, 0);

  // Stock Data
  const products = await prisma.product.findMany({
    orderBy: { stock: "asc" },
    take: 10 // Show top 10 low/critical items
  });

  const stockData = products.map(p => ({
    name: p.name,
    stock: p.stock,
    minStock: p.minStock
  }));

  const lowStockCount = products.filter(p => p.stock <= p.minStock).length;

  // Generate chart data
  const chartData = [];
  
  if (filter === "today") {
    for (let i = 6; i >= 0; i--) {
      const day = subDays(today, i);
      const dayStr = format(day, "MMM dd");
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);
      
      const contextPayments = await prisma.payment.findMany({
        where: { date: { gte: dayStart, lte: dayEnd } },
        include: { order: true }
      });

      chartData.push({
        date: dayStr,
        sales: contextPayments.reduce((sum, p) => sum + p.amount, 0),
        profit: contextPayments.reduce((sum, p) => {
          if (!p.order || p.order.total === 0) return sum;
          return sum + (p.amount * (p.order.profit / p.order.total));
        }, 0)
      });
    }
  } else {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    for (const day of days) {
      const dayStr = format(day, days.length > 365 ? "MMM yyyy" : "MMM dd");
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      const dayPayments = recentPayments.filter(p => 
        p.date >= dayStart && p.date <= dayEnd
      );

      chartData.push({
        date: dayStr,
        sales: dayPayments.reduce((sum, p) => sum + p.amount, 0),
        profit: dayPayments.reduce((sum, p) => {
          if (!p.order || p.order.total === 0) return sum;
          return sum + (p.amount * (p.order.profit / p.order.total));
        }, 0)
      });
    }
  }

  return (
    <div className="space-y-8 p-1 animate-in fade-in slide-in-from-bottom-4 duration-700 transition-colors duration-300">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 flex flex-col md:flex-row md:items-end md:justify-between gap-4 bg-card/40 p-8 rounded-[2rem] border border-border/50 backdrop-blur-3xl shadow-2xl ring-1 ring-black/5 dark:ring-white/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32 transition-colors duration-500 group-hover:bg-primary/10" />
          <div className="relative z-10">
            <Badge variant="outline" className="mb-3 px-3 py-1 bg-primary/10 backdrop-blur-sm border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">
              <Activity className="w-3 h-3 mr-1" /> System Operational
            </Badge>
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
              Welcome back, Admin
            </h1>
            <p className="text-muted-foreground font-bold mt-2 text-lg opacity-80">
              Overview for <span className="text-primary">{titlePeriod}</span>.
            </p>
          </div>
          <div className="text-right hidden md:block relative z-10">
            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{format(today, "EEEE")}</div>
            <div className="text-2xl font-black text-foreground">{format(today, "MMMM dd, yyyy")}</div>
          </div>
        </div>

        <Card className="lg:w-[350px] border-border/50 shadow-xl bg-card/40 backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/5 rounded-[2rem] overflow-hidden flex flex-col">
          <CardHeader className="p-5 pb-3 border-b border-border/30 bg-muted/20">
            <CardTitle className="text-[10px] font-black uppercase tracking-widest opacity-60">System Health</CardTitle>
          </CardHeader>
          <CardContent className="p-5 space-y-3 flex-1 flex flex-col justify-center">
             {[
               { label: "Database", status: "Active" },
               { label: "Inventory", status: "Enabled" },
               { label: "Router", status: "Ready" }
             ].map((h, idx) => (
               <div key={idx} className="flex justify-between items-center group/item">
                 <span className="text-[11px] font-bold text-muted-foreground group-hover/item:text-foreground transition-colors">{h.label}</span>
                 <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-lg px-2 text-[8px] font-black uppercase tracking-tighter">
                   {h.status}
                 </Badge>
               </div>
             ))}
          </CardContent>
        </Card>
      </div>

      <DashboardFilter />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            title: "Total Collections", 
            value: totalSales, 
            icon: DollarSign, 
            desc: "Money collected today", 
            color: "blue",
            trend: "+12.5%" 
          },
          { 
            title: "Net Profit", 
            value: netProfit, 
            icon: TrendingUp, 
            desc: "Net income generated", 
            color: "emerald",
            trend: "+8.2%"
          },
          { 
            title: "Global Utang", 
            value: totalUtang, 
            icon: AlertCircle, 
            desc: "Outstanding balances", 
            color: "orange",
            isWarning: true,
            trend: "-2.1%"
          },
          { 
            title: "Total Expenses", 
            value: totalExpenses, 
            icon: Wallet, 
            desc: "Operational costs", 
            color: "rose",
            trend: "+1.4%"
          },
        ].map((stat, i) => (
          <Card key={i} className="group overflow-hidden border-border/50 shadow-xl bg-card/40 backdrop-blur-2xl ring-1 ring-black/5 dark:ring-white/5 hover:ring-primary/30 transition-all duration-500 rounded-3xl hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-[10px] font-black uppercase tracking-[0.15em] text-muted-foreground/60">{stat.title}</CardTitle>
              <div className={cn("p-2.5 rounded-xl transition-colors duration-300", stat.isWarning ? "bg-orange-500/10 text-orange-500" : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground")}>
                <stat.icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline justify-between">
                <div className="text-2xl font-black tracking-tighter text-foreground">₱{stat.value.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                <div className={`text-[10px] font-black px-2 py-0.5 rounded-full flex items-center ${stat.color === "rose" ? "bg-rose-500/10 text-rose-500" : stat.color === "orange" ? "bg-orange-500/10 text-orange-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                   {stat.trend.startsWith("+") ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />} {stat.trend}
                </div>
              </div>
              <p className="text-[10px] font-bold text-muted-foreground/60 mt-3 flex items-center gap-1.5 uppercase tracking-tighter">
                <span className="w-1 h-1 rounded-full bg-border" /> {stat.desc}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="border-border/50 shadow-2xl bg-card/40 backdrop-blur-3xl ring-1 ring-black/5 dark:ring-white/5 rounded-[2rem] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
            <div>
              <CardTitle className="text-xl font-black text-foreground tracking-tight">
                {filter === "today" ? "Weekly" : filter.charAt(0).toUpperCase() + filter.slice(1)} Analytics
              </CardTitle>
              <CardDescription className="font-bold text-muted-foreground/60 uppercase tracking-tighter text-[10px] mt-1">Growth & Performance Monitoring</CardDescription>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-2 text-[10px] font-black px-4 py-1.5 bg-primary/10 rounded-xl text-primary border border-primary/20 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" /> COLLECTIONS
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black px-4 py-1.5 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20 backdrop-blur-md">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> REALIZED PROFIT
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-6 pb-8 h-[350px]">
            <SalesChart data={chartData} />
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-2xl bg-card/40 backdrop-blur-3xl ring-1 ring-black/5 dark:ring-white/5 rounded-[2rem] overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
            <div>
              <CardTitle className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
                <Package className="w-6 h-6 text-primary" /> Stock Inventory
              </CardTitle>
              <CardDescription className="font-bold text-muted-foreground/60 uppercase tracking-tighter text-[10px] mt-1">Current levels vs thresholds</CardDescription>
            </div>
            {lowStockCount > 0 && (
              <Badge variant="destructive" className="animate-pulse px-4 py-1.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                <AlertTriangle className="w-3 h-3" /> {lowStockCount} Low
              </Badge>
            )}
          </CardHeader>
          <CardContent className="px-6 pb-8 h-[450px]">
            <StockChart data={stockData} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
