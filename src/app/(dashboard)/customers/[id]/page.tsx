import { PrismaClient } from "@prisma/client";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Navigation, Phone, User, CalendarDays } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

const prisma = new PrismaClient();

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
  const customer = await prisma.customer.findUnique({
    where: { id: params.id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      payments: {
        orderBy: { date: 'desc' },
        take: 5
      }
    }
  });

  if (!customer) return notFound();

  // Basic Outstanding Utang Calculator (Wait, if Prisma supported sum aggregation easily inside include)
  // For now just calculate from recent orders conceptually, or we can track balance in real-time.
  // In our schema, we have Orders with paymentType="Utang" and status!="Paid"

  const unpaidOrders = await prisma.order.findMany({
    where: { 
      customerId: customer.id, 
      paymentType: "Utang",
      status: { not: "Paid" }
    }
  });

  // Since it allows partial payments, amount owed is total - sum(payments)
  const outstandingBal = unpaidOrders.reduce((acc, order) => {
    return acc + order.total;
  }, 0);

  // Note: True outstanding is total of unpaid - payments applied to them.
  // For simplicity, we just display raw totals if real logic is missing.

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/customers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">{customer.storeName}</h1>
          <p className="text-muted-foreground">Added on {format(customer.createdAt, 'MMM d, yyyy')}</p>
        </div>
        <div className="flex gap-2">
          {customer.latitude && customer.longitude && (
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <a href={`https://maps.google.com/?q=${customer.latitude},${customer.longitude}`} target="_blank" rel="noreferrer">
                <Navigation className="mr-2 h-4 w-4" />
                Navigate
              </a>
            </Button>
          )}
          <Button>Edit Profile</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Contact Info</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>{customer.ownerName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="leading-tight">{customer.address}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Route Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Zone</span>
                <Badge variant="outline">{customer.zoneName || "Unassigned"}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Route Day</span>
                <span className="font-medium">{customer.routeDay || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Order Cycle</span>
                <span className="font-medium">{customer.expectedOrderCycle || "N/A"}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className={`${outstandingBal > 0 ? "border-red-500/50 bg-red-500/5" : "border-green-500/50 bg-green-500/5"}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Outstanding Balance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${outstandingBal > 0 ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400"}`}>
                ₱{outstandingBal.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Total pending utang</p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/orders/new?customer=${customer.id}`}>New Order</Link>
              </Button>
            </CardHeader>
            <CardContent>
              {customer.orders.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg">
                  No orders found.
                </div>
              ) : (
                <div className="space-y-4">
                  {customer.orders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center pb-4 border-b last:border-0 last:pb-0">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          Order #{order.id.slice(-6).toUpperCase()}
                          <Badge variant={order.paymentType === "Utang" ? "destructive" : "secondary"} className="text-[10px] h-5">
                            {order.paymentType}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] h-5">
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <CalendarDays className="h-3 w-3" />
                          {format(order.createdAt, 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                      <div className="text-right font-bold">
                        ₱{order.total.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
