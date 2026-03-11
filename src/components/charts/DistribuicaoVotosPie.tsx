"use client";

import React, { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { MunicipioComVariacao } from "@/lib/data";

const COLORS = ["#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#94a3b8"];

interface DistribuicaoVotosPieProps {
  municipios: MunicipioComVariacao[];
}

function formatVotos(n: number) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

export default function DistribuicaoVotosPie({ municipios }: DistribuicaoVotosPieProps) {
  const data = useMemo(() => {
    const total = municipios.reduce((s, m) => s + m.votos_2022, 0);
    if (total === 0) return [{ name: "Sem dados", value: 1 }];

    const top5 = [...municipios]
      .sort((a, b) => b.votos_2022 - a.votos_2022)
      .slice(0, 5);
    const top5Sum = top5.reduce((s, m) => s + m.votos_2022, 0);
    const outros = total - top5Sum;

    const items = top5.map((m) => ({
      name: m.municipio,
      value: m.votos_2022,
    }));
    if (outros > 0) {
      items.push({ name: "Outros Municípios", value: outros });
    }
    return items;
  }, [municipios]);

  if (data.length === 0 || (data.length === 1 && data[0].name === "Sem dados")) {
    return (
      <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
        Sem dados para exibir
      </div>
    );
  }

  return (
    <div className="h-[280px] min-h-[280px] w-full min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="white" strokeWidth={1.5} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number | undefined) => formatVotos(value ?? 0)}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "6px",
              boxShadow: "0 2px 4px rgb(0 0 0 / 0.05)",
              fontSize: "12px",
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            formatter={(value) => (
              <span className="text-xs text-slate-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
