import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4, Construction } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between p-6 bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl shadow-lg ring-1 ring-black/5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent inline-flex items-center gap-2">
            <BarChart4 className="text-violet-600 h-8 w-8" /> Advanced Reports
          </h1>
          <p className="text-muted-foreground mt-2 font-medium">Export and deep dive into your business metrics.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-xl bg-white/60 backdrop-blur-md rounded-3xl border-0 ring-1 ring-black/5 flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
          <Construction className="mx-auto h-16 w-16 text-muted-foreground/30 animate-pulse mb-4" />
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-500 bg-clip-text text-transparent">Coming Soon</CardTitle>
          <p className="text-muted-foreground mt-2 max-w-sm font-medium">
            We are currently building PDF and CSV export functionalities for monthly sales and utang ledgers.
          </p>
        </Card>
      </div>
    </div>
  );
}
