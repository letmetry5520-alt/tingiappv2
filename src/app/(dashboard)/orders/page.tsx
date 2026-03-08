import { PrismaClient } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PaymentDialog } from "../receivables/PaymentDialog";

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
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Manage</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
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
                      <div className="font-semibold text-slate-900">{order.customer.storeName}</div>
                      <div className="text-xs text-muted-foreground">{order.customer.ownerName}</div>
                    </TableCell>
                    <TableCell className="font-bold">₱{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={order.paymentType === "Cash" ? "outline" : "secondary"} className="rounded-full px-3">
                        {order.paymentType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`rounded-full px-3 ${isPaid ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"}`}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {!isPaid && (
                        <div className="flex justify-end gap-2">
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
                        </div>
                      )}
                      {isPaid && (
                        <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 font-bold uppercase text-[9px]">Completed</Badge>
                      )}
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
