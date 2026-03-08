import { PrismaClient } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Plus, Users, Search } from "lucide-react";
import Link from "next/link";
import { CustomerTable } from "./CustomerTable";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const prisma = new PrismaClient();

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { storeName: "asc" }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-white/40 border border-white/60 backdrop-blur-3xl rounded-[2.5rem] shadow-2xl ring-1 ring-black/5 gap-6">
        <div className="flex items-center gap-5">
           <div className="p-4 bg-primary/10 rounded-3xl text-primary shadow-inner">
             <Users className="h-8 w-8" />
           </div>
           <div>
             <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">Customers</h1>
             <p className="text-muted-foreground font-semibold mt-1">Manage your sari-sari store clients & routes.</p>
           </div>
        </div>
        <div className="flex w-full md:w-auto gap-3">
          <Button asChild size="lg" className="rounded-2xl h-14 px-8 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 font-bold group">
            <Link href="/customers/new" className="flex items-center">
              <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
              Add Partner Store
            </Link>
          </Button>
        </div>
      </div>
      
      <Card className="border-0 shadow-2xl bg-white/60 backdrop-blur-2xl ring-1 ring-black/5 rounded-[2rem] overflow-hidden">
        <CardHeader className="bg-slate-50/30 border-b border-black/[0.03] px-8 py-6">
           <div className="flex justify-between items-center">
             <div>
               <CardTitle className="text-xl font-bold">Partner Ecosystem</CardTitle>
               <CardDescription className="font-semibold text-muted-foreground">Detailed listing of all active store accounts.</CardDescription>
             </div>
             <div className="relative w-64 hidden sm:block">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
               <Input placeholder="Fast search..." className="pl-9 bg-white/80 border-0 shadow-inner rounded-xl h-10 ring-1 ring-black/5 focus:ring-2 focus:ring-primary/20 transition-all" />
             </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
          <CustomerTable data={customers} />
        </CardContent>
      </Card>
    </div>
  );
}
