"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { AnoVotos } from "@/lib/data";

interface EvolucaoVotosChartProps {
  data: AnoVotos[];
}

export default function EvolucaoVotosChart({ data }: EvolucaoVotosChartProps) {
  const formatVotos = (value: number) =>
    value.toLocaleString("pt-BR", { maximumFractionDigits: 0 });

  return (
    <div className="h-[360px] min-h-[360px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorVotos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#94a3b8"
            opacity={0.3}
            vertical={false}
          />
          <XAxis
            dataKey="ano"
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatVotos}
            tick={{ fontSize: 12, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={70}
          />
          <Tooltip
            formatter={(value: number | undefined) => [formatVotos(value ?? 0), "Votos"]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            }}
            labelFormatter={(label) => `Ano: ${label}`}
          />
          <Area
            type="monotone"
            dataKey="votos"
            stroke="#4f46e5"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorVotos)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
