"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

type ChartData = {
  date: string;
  sales: number;
  profit: number;
};

export function SalesChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 30, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1}/>
          </linearGradient>
          <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        <XAxis
          dataKey="date"
          stroke="currentColor"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          className="text-muted-foreground/50 font-black tracking-tighter"
          dy={10}
        />
        <YAxis
          hide={true}
        />
        <Tooltip
          contentStyle={{ 
            backgroundColor: 'var(--card)', 
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
            backdropFilter: 'blur(12px)'
          }}
          itemStyle={{ fontSize: '13px', fontWeight: 'bold' }}
          labelStyle={{ fontSize: '11px', color: 'var(--muted-foreground)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 'black' }}
          formatter={(value: any) => [`₱${Number(value).toLocaleString()}`, '']}
          cursor={{ fill: "var(--muted)", opacity: 0.1 }}
        />
        <Bar 
          dataKey="sales" 
          fill="url(#salesGradient)" 
          radius={[4, 4, 0, 0]} 
          barSize={40} 
          label={{ position: 'top', fill: 'currentColor', fontSize: 11, fontWeight: '800', offset: 10, formatter: (val: any) => val > 0 ? `₱${Math.round(val/1000)}k` : '' }} 
        />
        <Bar 
          dataKey="profit" 
          fill="url(#profitGradient)" 
          radius={[4, 4, 0, 0]} 
          barSize={40} 
          label={{ position: 'top', fill: '#10b981', fontSize: 11, fontWeight: '800', offset: 10, formatter: (val: any) => val > 0 ? `₱${Math.round(val/1000)}k` : '' }} 
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
