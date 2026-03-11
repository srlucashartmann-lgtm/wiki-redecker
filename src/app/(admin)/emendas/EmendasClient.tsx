"use client";

import React, { useMemo, useState, useCallback } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { Emenda, EmendasKPIs, EmendaChartPoint } from "@/lib/emendas";

function formatReais(n: number) {
  return n.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  });
}

function formatReaisCompact(n: number) {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `R$ ${(n / 1_000).toFixed(0)}k`;
  return formatReais(n);
}

interface EmendasClientProps {
  kpis: EmendasKPIs;
  chartData: EmendaChartPoint[];
  emendas: Emenda[];
}

type StatusFilter = "todos" | Emenda["status"];
type SortBy = "maior_empenhado" | "menor_empenhado" | "mais_recente";

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "Pago", label: "Pago" },
  { value: "Pendente", label: "Pendente" },
  { value: "Parcial", label: "Parcial" },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "maior_empenhado", label: "Maior Valor Empenhado" },
  { value: "menor_empenhado", label: "Menor Valor Empenhado" },
  { value: "mais_recente", label: "Mais Recente (Ano)" },
];

const inputSelectClasses =
  "h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500";

const ChevronDown = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const ChevronUp = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
  </svg>
);

export default function EmendasClient({ kpis, chartData, emendas }: EmendasClientProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [areaFilter, setAreaFilter] = useState<string>("todas");
  const [sortBy, setSortBy] = useState<SortBy>("maior_empenhado");
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);

  const toggleRow = useCallback((index: number) => {
    setExpandedRowId((prev) => (prev === index ? null : index));
  }, []);

  const uniqueAreas = useMemo(() => {
    const areas = new Set(emendas.map((e) => e.area).filter(Boolean));
    return Array.from(areas).sort((a, b) => a.localeCompare(b));
  }, [emendas]);

  const filtered = useMemo(() => {
    let result = emendas;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (e) =>
          e.municipio.toLowerCase().includes(q) ||
          e.area.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== "todos") {
      result = result.filter((e) => e.status === statusFilter);
    }

    if (areaFilter !== "todas") {
      result = result.filter((e) => e.area === areaFilter);
    }

    if (sortBy === "maior_empenhado") {
      result = [...result].sort((a, b) => b.valor_empenhado - a.valor_empenhado);
    } else if (sortBy === "menor_empenhado") {
      result = [...result].sort((a, b) => a.valor_empenhado - b.valor_empenhado);
    } else {
      result = [...result].sort((a, b) => b.ano - a.ano);
    }

    return result;
  }, [emendas, search, statusFilter, areaFilter, sortBy]);

  const statusBadge = (status: Emenda["status"]) => {
    const styles = {
      Pago: "bg-green-100 text-green-700",
      Parcial: "bg-blue-100 text-blue-700",
      Pendente: "bg-amber-100 text-amber-700",
    };
    return (
      <span
        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Empenhado</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {formatReaisCompact(kpis.totalEmpenhado)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total Pago</p>
          <p className="mt-1 text-2xl font-bold text-green-600">
            {formatReaisCompact(kpis.totalPago)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Municípios Beneficiados</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {kpis.municipiosAtendidos}
            <span className="text-base font-normal text-slate-500"> cidades</span>
          </p>
        </div>
      </div>

      {/* BarChart */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">
          Volume de Emendas por Ano
        </h3>
        <div className="h-[300px] min-h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e2e8f0"
                opacity={0.6}
                vertical={false}
              />
              <XAxis
                dataKey="ano"
                tick={{ fontSize: 12, fill: "#64748b" }}
                axisLine={{ stroke: "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatReaisCompact(v)}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
                width={70}
              />
              <Tooltip
                cursor={{ fill: "rgba(241, 245, 249, 0.5)" }}
                formatter={(value: number | undefined, name?: string) => [
                  formatReais(value ?? 0),
                  name === "empenhado" ? "Empenhado" : "Pago",
                ]}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  fontSize: "12px",
                }}
                labelFormatter={(label) => `Ano: ${label}`}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px" }}
                formatter={(value) => (value === "empenhado" ? "Empenhado" : "Pago")}
              />
              <Bar dataKey="empenhado" fill="#4f46e5" name="empenhado" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pago" fill="#22c55e" name="pago" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabela */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
        {/* Barra de Ferramentas */}
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4">
          <div className="relative flex-1 md:max-w-xs">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Buscar município ou área..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-9 pr-3 placeholder-slate-400 ${inputSelectClasses}`}
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className={`min-w-[120px] ${inputSelectClasses}`}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className={`min-w-[140px] ${inputSelectClasses}`}
            >
              <option value="todas">Todas as áreas</option>
              {uniqueAreas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className={`min-w-[180px] ${inputSelectClasses}`}
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-full overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="w-10 px-3 py-2.5 font-medium text-slate-600 sm:px-4 sm:py-3"></th>
                <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4 sm:py-3">Município</th>
                <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4 sm:py-3">Ano</th>
                <th className="hidden px-3 py-2.5 font-medium text-slate-600 sm:table-cell sm:px-4 sm:py-3">Área</th>
                <th className="px-3 py-2.5 font-medium text-slate-600 text-right sm:px-4 sm:py-3">Valor Empenhado</th>
                <th className="px-3 py-2.5 font-medium text-slate-600 text-right sm:px-4 sm:py-3">Valor Pago</th>
                <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4 sm:py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => {
                const isExpanded = expandedRowId === i;
                return (
                  <React.Fragment key={`${e.municipio}-${e.ano}-${i}`}>
                    <tr
                      onClick={() => toggleRow(i)}
                      className={`cursor-pointer border-b border-slate-100 transition-colors hover:bg-slate-50 ${
                        isExpanded ? "bg-slate-50/80" : ""
                      }`}
                    >
                      <td className="px-3 py-2.5 text-slate-400 sm:px-4 sm:py-3">
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-800 sm:px-4 sm:py-3">
                        {e.municipio}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 sm:px-4 sm:py-3">{e.ano}</td>
                      <td className="hidden px-3 py-2.5 text-slate-600 sm:table-cell sm:px-4 sm:py-3">
                        {e.area}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 sm:px-4 sm:py-3">
                        {formatReais(e.valor_empenhado)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 sm:px-4 sm:py-3">
                        {formatReais(e.valor_pago)}
                      </td>
                      <td className="px-3 py-2.5 sm:px-4 sm:py-3">{statusBadge(e.status)}</td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td
                          colSpan={7}
                          className="border-y border-slate-100 bg-slate-50 p-0 align-top"
                        >
                          <div className="border-y border-slate-100 bg-slate-50 p-5">
                            {e.acao_orcamentaria || e.plano_orcamentario ? (
                              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Ação Orçamentária
                                  </p>
                                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
                                    {e.acao_orcamentaria || "—"}
                                  </p>
                                </div>
                                <div>
                                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Plano Orçamentário
                                  </p>
                                  <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-700">
                                    {e.plano_orcamentario || "—"}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm italic text-slate-500">
                                Detalhamento não especificado na base de dados.
                              </p>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-500">
            Nenhuma emenda encontrada.
          </div>
        )}
      </div>
    </div>
  );
}
