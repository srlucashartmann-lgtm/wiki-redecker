"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface PontoEvolucao {
  ano: string;
  votos: number;
}

interface MunicipioChartProps {
  data: PontoEvolucao[];
  tendencia: "alta" | "baixa";
}

export default function MunicipioChart({ data, tendencia }: MunicipioChartProps) {
  const strokeColor = tendencia === "alta" ? "#4f46e5" : "#dc2626";

  const formatVotos = (value: number | undefined) =>
    (value ?? 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 });

  return (
    <div className="h-[300px] min-h-[300px] w-full min-w-0 px-2 pb-2 md:px-4">
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e2e8f0"
            opacity={0.6}
            vertical={false}
          />
          <XAxis
            dataKey="ano"
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={{ stroke: "#e2e8f0" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatVotos}
            tick={{ fontSize: 11, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={50}
          />
          <Tooltip
            formatter={(value: number | undefined) => [formatVotos(value), "Votos"]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              boxShadow: "0 2px 4px rgb(0 0 0 / 0.05)",
              fontSize: "12px",
            }}
            labelFormatter={(label) => `Ano: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="votos"
            stroke={strokeColor}
            strokeWidth={2}
            dot={{ fill: strokeColor, strokeWidth: 0, r: 3 }}
            activeDot={{ r: 4, fill: strokeColor, stroke: "white", strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
