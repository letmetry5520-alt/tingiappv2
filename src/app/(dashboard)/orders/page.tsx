import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format, differenceInDays } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Clock } from "lucide-react";
import { PaymentDialog } from "../receivables/PaymentDialog";
import { DeliveryStatusSelect } from "./DeliveryStatusSelect";
import { OrderDetailsDialog } from "./OrderDetailsDialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info, MapPin, User as UserIcon, Phone } from "lucide-react";

export const dynamic = "force-dynamic";

const prisma = new PrismaClient();

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: { customer: true, payments: true },
    take: 50,
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center bg-white/50 p-6 rounded-2xl shadow-sm border border-white/40 backdrop-blur-xl">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Orders History
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Review your latest 50 transactions.</p>
        </div>
        <Button asChild size="lg" className="rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all duration-300">
          <Link href="/orders/new">
            <Plus className="mr-2 h-5 w-5" /> New Fast Order
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden border-0 shadow-xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-3xl">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow>
              <TableHead>Date / Time</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total Value</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Logistic</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  No orders found. Create a new one.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const isPaid = order.status === "Paid";
                return (
                  <TableRow key={order.id} className="hover:bg-black/[0.02] transition-colors">
                    <TableCell className="font-medium whitespace-nowrap">
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
                              <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                <div>
                                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Verified Address</div>
                                  <div className="text-sm font-medium leading-tight text-slate-700">{order.customer.address}</div>
                                </div>
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
                             differenceInDays(new Date(order.dueDate), new Date()) < 0 
                             ? "bg-rose-500 text-white animate-pulse" 
                             : "bg-amber-100 text-amber-700"
                           }`}>
                             <Clock className="w-2.5 h-2.5" />
                             {differenceInDays(new Date(order.dueDate), new Date()) < 0 
                               ? "OVERDUE" 
                               : `DUE IN ${differenceInDays(new Date(order.dueDate), new Date())} DAYS`}
                           </Badge>
                        )}
                      </div>
                    </TableCell>
                     <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
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
      </Card>
    </div>
  );
}
