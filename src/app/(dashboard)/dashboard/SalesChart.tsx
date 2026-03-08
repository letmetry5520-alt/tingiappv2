"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

type ChartData = {
  date: string;
  sales: number;
  profit: number;
};

export function SalesChart({ data }: { data: ChartData[] }) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="date"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₱${value}`}
        />
        <Tooltip
          formatter={(value) => `₱${Number(value).toFixed(2)}`}
          cursor={{ fill: "transparent" }}
        />
        <Bar dataKey="sales" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-primary" />
        <Bar dataKey="profit" fill="currentColor" radius={[4, 4, 0, 0]} className="fill-green-500" />
      </BarChart>
    </ResponsiveContainer>
  );
}
