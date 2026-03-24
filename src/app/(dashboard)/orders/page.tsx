import { PrismaClient } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays, isToday } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Clock, AlarmClock } from "lucide-react";
import { PaymentDialog } from "../receivables/PaymentDialog";
import { DeliveryStatusSelect } from "./DeliveryStatusSelect";
import { OrderDetailsDialog } from "./OrderDetailsDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info, MapPin, User as UserIcon, Phone, Navigation } from "lucide-react";
import { OrderInvoiceWrapper } from "./OrderInvoiceWrapper";
import { Card } from "@/components/ui/card";
import { OrdersFilter } from "./OrdersFilter";
import { DelinquentToggle } from "./DelinquentToggle";
import { AdjustmentModal } from "./AdjustmentModal";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string }>;
}) {
  const { status: rawStatus, type: rawType } = await searchParams;
  const allOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, payments: true },
    take: 200,
  });

  const now = new Date();

  // Compute counts for badges on the filter bar
  const totalDueToday = allOrders.filter(
    (o) => o.dueDate && isToday(new Date(o.dueDate)) && o.status !== "Paid"
  ).length;
  const totalOverdue = allOrders.filter(
    (o) => o.dueDate && differenceInDays(new Date(o.dueDate), now) < 0 && o.status !== "Paid"
  ).length;

  // --- FILTER ---
  const statusFilter = rawStatus || "pending";
  const typeFilter = rawType || "all";

  let filtered = allOrders.filter((order) => {
    const isPaid = order.status === "Paid";
    const daysUntilDue = order.dueDate ? differenceInDays(new Date(order.dueDate), now) : null;

    if (typeFilter === "cash" && order.paymentType !== "Cash") return false;
    if (typeFilter === "utang" && order.paymentType !== "Utang") return false;

    if (statusFilter === "pending" && isPaid) return false;
    if (statusFilter === "paid" && !isPaid) return false;
    if (statusFilter === "due_today") {
      if (!order.dueDate || !isToday(new Date(order.dueDate)) || isPaid) return false;
    }
    if (statusFilter === "overdue") {
      if (daysUntilDue === null || daysUntilDue >= 0 || isPaid) return false;
    }
    return true;
  });

  // --- SORT: Overdue first, then Due today, then Due soon, then rest by date desc ---
  const getDuePriority = (order: typeof allOrders[0]) => {
    if (order.status === "Paid") return 5;             // Paid/Completed → lower
    if (order.customer.isDelinquent) return 10;        // Delinquent → absolute bottom
    if (!order.dueDate) return 4;                      // No due date → buffer
    
    const dueDate = new Date(order.dueDate);
    const diff = differenceInDays(dueDate, now);

    if (diff < 0) return 0;                            // Overdue → Top priority
    if (isToday(dueDate)) return 1;                    // Due Today → Second
    if (diff <= 2) return 2;                           // Due Soon (2 days) → Third
    return 3;                                          // Safe / Future
  };

  filtered.sort((a, b) => {
    const pa = getDuePriority(a);
    const pb = getDuePriority(b);
    if (pa !== pb) return pa - pb;

    // Sub-sorting: For urgent orders (0, 1, 2), sort by dueDate ASC (earliest first)
    if (pa <= 2 && a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    // Default sub-sorting: Newest creation date first
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const orders = filtered.slice(0, 50);

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-white/50 p-4 sm:p-6 rounded-2xl shadow-sm border border-white/40 backdrop-blur-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Orders History
          </h1>
          <p className="text-muted-foreground font-medium mt-1 text-sm">
            Showing {orders.length} of {allOrders.length} orders
          </p>
        </div>
        <Button asChild size="sm" className="rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300">
          <Link href="/orders/new">
            <Plus className="mr-1.5 h-4 w-4" /> New Order
          </Link>
        </Button>
      </div>

      {/* Filter Bar */}
      <OrdersFilter totalDueToday={totalDueToday} totalOverdue={totalOverdue} />

      {/* ── MOBILE CARD LIST (hidden on md+) ── */}
      <div className="flex flex-col gap-3 md:hidden">
        {orders.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">No orders match the selected filters.</div>
        ) : (
          orders.map((order) => {
            const isPaid = order.status === "Paid";
            const daysUntilDue = order.dueDate ? differenceInDays(new Date(order.dueDate), now) : null;
            const isDueToday = order.dueDate ? isToday(new Date(order.dueDate)) : false;
            const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && !isPaid;

            return (
              <Card
                key={order.id}
                className={`p-4 rounded-2xl border-0 shadow-md bg-white/80 backdrop-blur space-y-3 ${
                  isDueToday && !isPaid ? "ring-2 ring-amber-400" : isOverdue ? "ring-2 ring-rose-400" : ""
                } ${order.customer.isDelinquent ? "border-l-4 border-rose-500" : ""}`}
              >
                {/* Due Today / Overdue Banner */}
                {(isDueToday || isOverdue) && !isPaid && (
                  <div className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg w-fit ${
                    isDueToday ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"
                  }`}>
                    {isDueToday ? <AlarmClock className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                    {isDueToday ? "DUE TODAY" : "OVERDUE"}
                  </div>
                )}

                {/* Row 1: Customer + Total */}
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900">{order.customer.storeName}</div>
                    <div className="text-xs text-muted-foreground">{order.customer.ownerName}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-slate-900">₱{order.total.toFixed(2)}</div>
                    <div className="text-[10px] text-muted-foreground">{format(new Date(order.createdAt), "MMM dd, yyyy · hh:mm a")}</div>
                  </div>
                </div>

                {/* Row 2: Badges */}
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant={order.paymentType === "Cash" ? "outline" : "secondary"} className="rounded-full px-3 text-xs">
                    {order.paymentType}
                  </Badge>
                  <Badge className={`rounded-full px-3 text-[10px] font-bold uppercase ${isPaid ? "bg-emerald-500 text-white" : "bg-orange-500 text-white"}`}>
                    {order.status}
                  </Badge>
                </div>

                {/* Row 3: Delivery Status + Due */}
                <div className="flex items-center gap-2 flex-wrap">
                  <DeliveryStatusSelect orderId={order.id} initialStatus={order.deliveryStatus || "Pending"} />
                  {order.paymentType === "Utang" && order.deliveryStatus === "Delivered" && !isPaid && order.dueDate && (
                    <Badge variant="outline" className={`rounded-xl px-2 py-0.5 text-[9px] font-black border-0 shadow-sm flex items-center gap-1.5 ${
                      isOverdue ? "bg-rose-500 text-white animate-pulse" : "bg-amber-100 text-amber-700"
                    }`}>
                      <Clock className="w-2.5 h-2.5" />
                      {isOverdue ? "OVERDUE" : isDueToday ? "DUE TODAY" : `DUE IN ${daysUntilDue} DAYS`}
                    </Badge>
                  )}
                </div>

                {/* Row 4: Actions */}
                <div className="flex gap-2 pt-1 border-t border-black/5 flex-wrap">
                  <OrderDetailsDialog order={order} />
                  <OrderInvoiceWrapper order={order} />
                  <DelinquentToggle 
                    customerId={order.customer.id} 
                    isDelinquent={order.customer.isDelinquent} 
                    storeName={order.customer.storeName} 
                  />
                  <AdjustmentModal 
                    orderId={order.id} 
                    storeName={order.customer.storeName} 
                  />
                  {!isPaid && (
                    <>
                      {order.paymentType === "Cash" && order.status === "Pending" ? (
                        <PaymentDialog order={{ id: order.id, total: order.total, payments: order.payments }} triggerText="Mark Paid" variant="default" />
                      ) : (
                        <PaymentDialog order={{ id: order.id, total: order.total, payments: order.payments }} triggerText="Collect" variant="outline" />
                      )}
                    </>
                  )}
                  {isPaid && (
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 font-bold uppercase text-[9px] self-center">Completed</Badge>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ── DESKTOP TABLE (hidden on mobile) ── */}
      <Card className="overflow-hidden border-0 shadow-xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-3xl hidden md:block">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead>Date / Time</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Total Value</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Logistic</TableHead>
                <TableHead className="text-center">Invoice</TableHead>
                <TableHead className="text-right">Manage</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                    No orders match the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => {
                  const isPaid = order.status === "Paid";
                  const daysUntilDue = order.dueDate ? differenceInDays(new Date(order.dueDate), now) : null;
                  const isDueToday = order.dueDate ? isToday(new Date(order.dueDate)) : false;
                  const isOverdue = daysUntilDue !== null && daysUntilDue < 0 && !isPaid;
                  const mapsUrl = order.customer.latitude != null && order.customer.longitude != null
                    ? `https://www.google.com/maps/dir/?api=1&destination=${order.customer.latitude},${order.customer.longitude}`
                    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.customer.address)}`;

                  return (
                    <TableRow
                      key={order.id}
                      className={`hover:bg-black/[0.02] transition-colors ${
                        isDueToday && !isPaid ? "bg-amber-50/60" : isOverdue ? "bg-rose-50/60" : ""
                      }`}
                    >
                      <TableCell className="font-medium whitespace-nowrap">
                        {(isDueToday || isOverdue) && !isPaid && (
                          <div className={`text-[9px] font-black uppercase tracking-widest mb-1 flex items-center gap-1 ${isDueToday ? "text-amber-600" : "text-rose-600"}`}>
                            {isDueToday ? <AlarmClock className="h-2.5 w-2.5" /> : <Clock className="h-2.5 w-2.5" />}
                            {isDueToday ? "DUE TODAY" : "OVERDUE"}
                          </div>
                        )}
                        {format(new Date(order.createdAt), "MMM dd, yyyy")}
                        <div className="text-xs text-muted-foreground">{format(new Date(order.createdAt), "hh:mm a")}</div>
                      </TableCell>
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild nativeButton={false}>
                            <div className="cursor-help transition-all hover:translate-x-1 inline-flex flex-col group/pop">
                              <div className="font-semibold text-slate-900 flex items-center gap-1.5 min-w-max">
                                {order.customer.storeName}
                                <Info className="h-3 w-3 opacity-0 group-hover/pop:opacity-40 transition-opacity" />
                              </div>
                              <div className="text-xs text-muted-foreground">{order.customer.ownerName}</div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent align="start" className="w-80 p-0 overflow-hidden border-0 shadow-2xl rounded-2xl bg-white/90 backdrop-blur-2xl ring-1 ring-black/5">
                            <div className="p-5 space-y-4">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                                  <UserIcon className="h-5 w-5" />
                                </div>
                                <div>
                                  <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Store Owner</div>
                                  <div className="font-bold text-slate-900">{order.customer.ownerName}</div>
                                </div>
                              </div>
                              <div className="space-y-3 pt-3 border-t border-black/[0.03]">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 pr-2">
                                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                    <div>
                                      <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verified Address</div>
                                      <div className="text-sm font-medium leading-tight text-slate-700">{order.customer.address}</div>
                                    </div>
                                  </div>
                                  <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full shadow-md bg-blue-500 hover:bg-blue-600 text-white border-0 shrink-0 transition-transform hover:scale-105" asChild>
                                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" title="Open in Google Maps">
                                      <Navigation className="h-4 w-4" />
                                    </a>
                                  </Button>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                                  <div>
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Primary Contact</div>
                                    <div className="text-sm font-bold text-slate-900">{order.customer.phone}</div>
                                  </div>
                                </div>
                              </div>
                              <Button variant="secondary" size="sm" className="w-full rounded-xl mt-2 h-10 font-bold" asChild>
                                <Link href={`/customers/${order.customer.id}`}>View Full Profile</Link>
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </TableCell>
                      <TableCell className="font-bold">₱{order.total.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge variant={order.paymentType === "Cash" ? "outline" : "secondary"} className="rounded-full px-3">
                          {order.paymentType}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`rounded-full px-3 text-[10px] font-bold uppercase tracking-tight ${isPaid ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-2">
                          <DeliveryStatusSelect orderId={order.id} initialStatus={order.deliveryStatus || "Pending"} />
                          {order.paymentType === "Utang" && order.deliveryStatus === "Delivered" && !isPaid && order.dueDate && (
                            <Badge variant="outline" className={`rounded-xl px-2 py-0.5 text-[9px] font-black border-0 shadow-sm flex items-center gap-1.5 w-fit ${
                              isOverdue ? "bg-rose-500 text-white animate-pulse" : "bg-amber-100 text-amber-700"
                            }`}>
                              <Clock className="w-2.5 h-2.5" />
                              {isOverdue ? "OVERDUE" : isDueToday ? "DUE TODAY" : `DUE IN ${daysUntilDue} DAYS`}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <OrderInvoiceWrapper order={order} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <AdjustmentModal 
                            orderId={order.id} 
                            storeName={order.customer.storeName} 
                          />
                          <DelinquentToggle 
                            customerId={order.customer.id} 
                            isDelinquent={order.customer.isDelinquent} 
                            storeName={order.customer.storeName} 
                          />
                          <OrderDetailsDialog order={order} />
                          {!isPaid && (
                            <>
                              {order.paymentType === "Cash" && order.status === "Pending" ? (
                                <PaymentDialog
                                  order={{ id: order.id, total: order.total, payments: order.payments }}
                                  triggerText="Mark as Paid"
                                  variant="default"
                                />
                              ) : (
                                <PaymentDialog
                                  order={{ id: order.id, total: order.total, payments: order.payments }}
                                  triggerText="Collect"
                                  variant="outline"
                                />
                              )}
                            </>
                          )}
                          {isPaid && (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 font-bold uppercase text-[9px]">Completed</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
