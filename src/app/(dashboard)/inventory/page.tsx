import { PrismaClient } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, PackageSearch, AlertTriangle, Warehouse, Box, Layers, History, Clock, Info } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { RestockButton } from "./RestockButton";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const prisma = new PrismaClient();

export default async function InventoryPage() {
  const products = await prisma.product.findMany({ orderBy: { name: "asc" } });
  const packages = await prisma.package.findMany({ orderBy: { name: "asc" } });
  
  const logs = await prisma.inventoryLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: true },
    take: 15
  });

  const lowStockProducts = products.filter(p => p.stock <= p.minStock);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-white/40 border border-white/60 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl ring-1 ring-black/5 gap-6 text-slate-900">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-primary/10 rounded-3xl text-primary shadow-inner">
             <Warehouse className="h-8 w-8" />
           </div>
           <div>
             <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Inventory</h1>
             <p className="text-muted-foreground font-semibold mt-1">Real-time stock tracking and package builder.</p>
           </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" asChild size="lg" className="rounded-2xl h-14 px-6 border-slate-200 bg-white/50 backdrop-blur-sm shadow-sm hover:bg-slate-50 transition-all font-bold group text-slate-900">
            <Link href="/packages/new" className="flex items-center">
              <PackageSearch className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Build Bundle
            </Link>
          </Button>
          <Button asChild size="lg" className="rounded-2xl h-14 px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 font-bold group">
            <Link href="/products/new" className="flex items-center">
              <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              Add Item
            </Link>
          </Button>
        </div>
      </div>

      {lowStockProducts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-[2rem] flex items-center gap-4 shadow-lg shadow-rose-500/5 animate-pulse">
          <div className="p-2 bg-rose-500 rounded-xl text-white">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <p className="font-black text-rose-900 uppercase text-xs tracking-widest mb-0.5">Critical Action Required</p>
            <p className="font-semibold text-sm">
              You have {lowStockProducts.length} product(s) below minimum stock levels.
            </p>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl border-rose-300 bg-white/50 text-rose-700 hover:bg-rose-600 hover:text-white font-bold" asChild>
             <Link href="#low-stock">View Items</Link>
          </Button>
        </div>
      )}

      <Tabs defaultValue="products" className="w-full">
        <div className="flex justify-center mb-8">
          <TabsList className="h-14 p-1.5 bg-white/40 backdrop-blur-xl border border-white/60 rounded-2xl shadow-xl ring-1 ring-black/5 gap-1.5 overflow-hidden">
            <TabsTrigger value="products" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white shadow-sm transition-all flex items-center gap-2">
              <Box className="w-4 h-4" /> Products
              <Badge variant="outline" className="ml-2 bg-black/5 border-0 font-black text-[10px]">{products.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="packages" className="rounded-xl px-8 font-bold data-[state=active]:bg-primary data-[state=active]:text-white shadow-sm transition-all flex items-center gap-2">
              <Layers className="w-4 h-4" /> Packages
              <Badge variant="outline" className="ml-2 bg-black/5 border-0 font-black text-[10px]">{packages.length}</Badge>
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="products">
          <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2rem] overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-0">
                  <TableHead className="px-8 h-14 font-bold uppercase tracking-tighter text-[11px] text-slate-900">Product / Category</TableHead>
                  <TableHead className="h-14 font-bold uppercase tracking-tighter text-[11px] text-slate-900">Financials</TableHead>
                  <TableHead className="h-14 font-bold uppercase tracking-tighter text-[11px] text-slate-900">Stock Status</TableHead>
                  <TableHead className="px-8 h-14 text-right font-bold uppercase tracking-tighter text-[11px] text-slate-900">Management</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-48 text-center text-muted-foreground font-medium text-slate-900">
                      <div className="flex flex-col items-center gap-3">
                         <Box className="h-10 w-10 opacity-20" />
                         Your inventory is currently empty.
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p.id} className="group hover:bg-black/[0.01] transition-all border-b border-black/[0.03] last:border-0 h-20 text-slate-900">
                      <TableCell className="px-8">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-primary transition-colors">{p.name}</span>
                          <span className="text-[10px] font-black uppercase text-muted-foreground flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="bg-slate-100/50 border-0 h-5 px-1.5 font-bold text-[9px]">{p.category}</Badge>
                            • {p.unit}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                         <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">₱{p.price.toFixed(2)}</span>
                            <span className="text-[10px] font-semibold text-muted-foreground tracking-tight">Cost: ₱{p.cost.toFixed(2)}</span>
                         </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={p.stock <= p.minStock ? "destructive" : "secondary"}
                          className={`rounded-full px-3 py-0.5 font-bold text-[10px] shadow-sm ${p.stock <= p.minStock ? "bg-rose-500 shadow-rose-200" : "bg-emerald-500/10 text-emerald-700 border-emerald-200/50"}`}
                        >
                          {p.stock} units available
                        </Badge>
                      </TableCell>
                      <TableCell className="px-8 text-right">
                         <div className="flex items-center justify-end gap-2">
                           <RestockButton productId={p.id} productName={p.name} />
                           <Button variant="outline" size="sm" className="rounded-xl h-9 px-4 border-slate-200 bg-white font-bold shadow-sm text-slate-900" asChild>
                             <Link href={`/products/${p.id}`}>Modify</Link>
                           </Button>
                         </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
        
        <TabsContent value="packages">
          <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2rem] overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50/50">
                <TableRow className="border-0">
                  <TableHead className="px-8 h-14 font-bold uppercase tracking-tighter text-[11px] text-slate-900">Bundle Profile</TableHead>
                  <TableHead className="h-14 font-bold uppercase tracking-tighter text-[11px] text-slate-900">Components</TableHead>
                  <TableHead className="h-14 font-bold uppercase tracking-tighter text-[11px] text-slate-900">Retail Price</TableHead>
                  <TableHead className="px-8 h-14 text-right font-bold uppercase tracking-tighter text-[11px] text-slate-900">Activity</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {packages.length === 0 ? (
                  <TableRow>
                     <TableCell colSpan={4} className="h-48 text-center text-muted-foreground font-medium text-slate-900">
                       <div className="flex flex-col items-center gap-3">
                          <Layers className="h-10 w-10 opacity-20" />
                          No bundled packages created yet.
                       </div>
                     </TableCell>
                  </TableRow>
                ) : (
                  packages.map((pkg) => (
                    <TableRow key={pkg.id} className="group hover:bg-black/[0.01] transition-all border-b border-black/[0.03] last:border-0 h-20 text-slate-900">
                      <TableCell className="px-8 font-black text-slate-900">{pkg.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-indigo-50/50 border-indigo-200/50 text-indigo-700 font-bold px-3 py-0.5 rounded-full text-[10px]">
                          {Array.isArray(pkg.items) ? `${pkg.items.length} units included` : "Multiple items"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-black text-emerald-600 text-lg">
                        ₱{pkg.price.toFixed(2)}
                      </TableCell>
                      <TableCell className="px-8 text-right">
                         <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all">
                            <History className="h-4 w-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      {/* NEW: Inventory Activity Logs */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
           <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-600">
             <History className="w-5 h-5" />
           </div>
           <div>
             <h2 className="text-xl font-black tracking-tight text-slate-900">Stock Activity Log</h2>
             <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Recent movements and restocking notes</p>
           </div>
        </div>

        <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2.5rem] overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="border-0">
                <TableHead className="px-8 h-14 font-bold uppercase tracking-tighter text-[11px] text-slate-900">Date / Time</TableHead>
                <TableHead className="h-14 font-bold uppercase tracking-tighter text-[11px] text-slate-900">Item</TableHead>
                <TableHead className="h-14 font-bold uppercase tracking-tighter text-[11px] text-slate-900">Action</TableHead>
                <TableHead className="px-8 h-14 font-bold uppercase tracking-tighter text-[11px] text-slate-900">Notes / Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground font-medium text-slate-900">
                    No recent inventory activity found.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id} className="border-b border-black/[0.02] last:border-0 h-16 text-slate-900">
                    <TableCell className="px-8">
                       <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                         <Clock className="w-3 h-3 opacity-40" />
                         {format(new Date(log.createdAt), "MMM dd, yyyy • p")}
                       </div>
                    </TableCell>
                    <TableCell className="font-extrabold text-slate-900">
                      {log.product?.name || "Unknown Product"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={cn(
                          "rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-tighter",
                          log.change > 0 ? "bg-emerald-500/10 text-emerald-600 border-emerald-200" : "bg-rose-500/10 text-rose-600 border-rose-200"
                        )}>
                          {log.change > 0 ? "+" : ""}{log.change} Units
                        </Badge>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{log.type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="px-8">
                       {log.notes ? (
                         <div className="flex items-start gap-2 max-w-md">
                           <Info className="w-3 h-3 mt-1 text-indigo-400 shrink-0" />
                           <span className="text-sm font-semibold text-slate-600 italic">"{log.notes}"</span>
                         </div>
                       ) : (
                         <span className="text-xs text-muted-foreground italic opacity-40">No additional notes provided</span>
                       )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
