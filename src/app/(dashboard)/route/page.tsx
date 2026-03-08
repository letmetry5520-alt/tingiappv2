import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, ShoppingCart, Receipt, Navigation, Calendar } from "lucide-react";
import Link from "next/link";
import { RouteMap } from "./RouteMap";

const prisma = new PrismaClient();

export default async function RoutePage() {
  const today = new Date();
  const dayName = format(today, "EEEE");

  const customers = await prisma.customer.findMany({
    where: { routeDay: dayName },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 1
      }
    }
  });

  const todayStr = format(today, "yyyy-MM-dd");

  const customersWithBal = await Promise.all(customers.map(async (c) => {
    const unpaid = await prisma.order.findMany({
      where: { customerId: c.id, paymentType: "Utang", status: { not: "Paid" } },
      include: { payments: true }
    });
    const balance = unpaid.reduce((sum, o) => {
       const paid = o.payments.reduce((pSum, p) => pSum + p.amount, 0);
       return sum + (o.total - paid);
    }, 0);
    
    // Check logistics status of the most relevant order
    const latestOrder = c.orders[0];
    let logisticsStatus: string | null = null;
    
    if (latestOrder) {
      // If it was created today, or if it is still ongoing, we consider its logistics status
      if (format(new Date(latestOrder.createdAt), "yyyy-MM-dd") === todayStr || latestOrder.deliveryStatus !== "Delivered") {
         logisticsStatus = latestOrder.deliveryStatus;
      }
    }

    return { ...c, balance, logisticsStatus };
  }));

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-white/40 border border-white/60 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl ring-1 ring-black/5 gap-6">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-primary/10 rounded-3xl text-primary shadow-inner">
             <MapPin className="h-8 w-8" />
           </div>
           <div>
             <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Daily Route</h1>
             <p className="text-muted-foreground font-semibold mt-1 flex items-center gap-2">
               Scheduled for <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-0 font-black tracking-widest text-[10px]">{dayName.toUpperCase()}</Badge>
             </p>
           </div>
        </div>
        <div className="hidden md:flex flex-col items-end">
          <div className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] mb-1">Operational Area</div>
          <Badge className="bg-slate-900 text-white rounded-xl px-4 py-1.5 font-bold shadow-lg shadow-slate-900/10 border-0">Global Logistics</Badge>
        </div>
      </div>

      {customersWithBal.length === 0 ? (
        <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2.5rem] flex flex-col items-center justify-center p-20 text-center">
          <div className="p-6 bg-slate-50 rounded-full mb-6">
            <Calendar className="h-12 w-12 text-muted-foreground opacity-30" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">No visits scheduled</h2>
          <p className="text-muted-foreground mt-2 max-w-sm font-medium leading-relaxed">
            There are no sari-sari stores assigned to the <strong>{dayName}</strong> route. Assign customers to this day to start optimizing your deliveries.
          </p>
          <Button variant="outline" className="mt-8 rounded-2xl h-12 px-8 border-slate-200 bg-white font-bold shadow-sm" asChild>
            <Link href="/customers">Modify Route Schedule</Link>
          </Button>
        </Card>
      ) : (
        <>
          <RouteMap customers={customersWithBal} />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {customersWithBal.map((c) => (
            <Card key={c.id} className="group flex flex-col border-0 shadow-xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 hover:ring-2 hover:ring-primary/20 transition-all duration-500 rounded-[2rem] overflow-hidden">
              <CardHeader className="pb-4 bg-slate-50/30 border-b border-black/[0.02] px-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-black tracking-tight text-slate-900 group-hover:text-primary transition-colors cursor-pointer">
                      <Link href={`/customers/${c.id}`}>{c.storeName}</Link>
                    </CardTitle>
                    <CardDescription className="font-semibold text-xs flex items-center gap-1">
                      <MapPin className="h-3 w-3 opacity-40 shrink-0" />
                      {c.address}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="rounded-xl bg-white/80 border-slate-200 text-slate-600 font-black text-[9px] uppercase tracking-tighter shadow-sm">{c.zoneName || "GLOBAL"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="py-6 flex-1 space-y-5 px-6">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <span>Supply History</span>
                  <span className="text-slate-900">
                    {c.orders.length > 0 ? format(new Date(c.orders[0].createdAt), 'MMM d, yyyy') : "NEW PARTNER"}
                  </span>
                </div>
                
                <div className={`p-4 rounded-2xl border transition-all duration-300 ${c.balance > 0 ? 'bg-rose-50 border-rose-100 shadow-inner' : 'bg-emerald-50 border-emerald-100 shadow-inner'}`}>
                  <div className="flex items-center justify-between">
                     <span className={`text-[10px] font-black uppercase tracking-widest ${c.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>Account Balance</span>
                     {c.balance > 0 ? <Receipt className="h-4 w-4 text-rose-500" /> : <Badge className="bg-emerald-500 border-0 h-4 px-1.5 text-[8px] font-black">CLEARED</Badge>}
                  </div>
                  <div className={`text-2xl font-black mt-1 ${c.balance > 0 ? 'text-rose-700' : 'text-emerald-700'}`}>
                    ₱{c.balance.toFixed(2)}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col gap-2 p-6 pt-0">
                <div className="grid grid-cols-2 gap-2 w-full">
                  {c.latitude && c.longitude && (
                    <Button variant="outline" className="rounded-xl h-12 border-blue-200 bg-white text-blue-600 hover:bg-blue-600 hover:text-white font-bold transition-all shadow-sm" asChild>
                      <a href={`https://maps.google.com/?q=${c.latitude},${c.longitude}`} target="_blank" rel="noreferrer">
                        <Navigation className="mr-2 h-4 w-4" /> Navigate
                      </a>
                    </Button>
                  )}
                   <Button variant="outline" className={`rounded-xl h-12 font-bold shadow-sm transition-all ${c.balance > 0 ? 'border-amber-200 bg-white text-amber-600 hover:bg-amber-600 hover:text-white' : 'opacity-50 pointer-events-none'}`} asChild>
                    <Link href={`/receivables`}>
                      <Receipt className="mr-2 h-4 w-4" /> Collect
                    </Link>
                  </Button>
                </div>
                <Button className="w-full rounded-xl h-14 text-md font-black shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all group" asChild>
                  <Link href={`/orders/new?customer=${c.id}`}>
                    <ShoppingCart className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" /> 
                    Quick Checkout
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
          </div>
        </>
      )}
    </div>
  );
}
