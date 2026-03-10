"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, LabelList } from "recharts";

type StockData = {
  name: string;
  stock: number;
  minStock: number;
};

export function StockChart({ data }: { data: StockData[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
      >
        <XAxis type="number" hide={true} />
        <YAxis 
          dataKey="name" 
          type="category" 
          stroke="currentColor"
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={100}
          className="text-muted-foreground font-bold uppercase tracking-tighter"
        />
        <Tooltip
          cursor={{ fill: "var(--muted)", opacity: 0.1 }}
          contentStyle={{ 
            backgroundColor: 'var(--card)', 
            border: '1px solid var(--border)',
            borderRadius: '16px',
            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
            backdropFilter: 'blur(12px)',
            padding: '12px'
          }}
          labelStyle={{ fontSize: '13px', fontWeight: 'black', color: 'var(--foreground)', marginBottom: '4px', textTransform: 'uppercase' }}
          itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
          formatter={(value: any, name: any, props: any) => {
            const minStock = props.payload?.minStock;
            const isLow = value <= minStock;
            return [
              <span key="val" className={isLow ? "text-rose-500" : "text-emerald-500"}>
                {value} {isLow ? `(Low! Threshold: ${minStock})` : `(Healthy)`}
              </span>,
              'Level'
            ];
          }}
        />
        <Bar dataKey="stock" radius={[0, 4, 4, 0]} barSize={34}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.stock <= entry.minStock ? "var(--destructive)" : "var(--primary)"}
              fillOpacity={entry.stock <= entry.minStock ? 0.9 : 0.6}
            />
          ))}
          <LabelList 
            dataKey="stock" 
            position="insideRight" 
            fill="#fff" 
            fontSize={12} 
            fontWeight="bold" 
            offset={10}
            formatter={(val: any) => (val !== undefined && val !== null ? val.toLocaleString() : '')}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
