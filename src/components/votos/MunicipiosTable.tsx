"use client";

import React, { useMemo, useState, useCallback } from "react";
import type { MunicipioComVariacao } from "@/lib/data";
import MunicipioChart from "@/components/charts/MunicipioChart";

const ChevronDown = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);
const ChevronRight = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
);
const SearchIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

type FiltroTendencia = "todos" | "altas" | "baixas";

interface MunicipiosTableProps {
  data: MunicipioComVariacao[];
}

function formatVotos(n: number) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

function formatTendencia(row: MunicipioComVariacao): string {
  const abs = row.votos_2022 - row.votos_2018;
  const sinal = abs > 0 ? "+" : "";
  const votosStr = `${sinal}${formatVotos(abs)} votos`;
  if (row.votos_2018 === 0) return votosStr;
  const pct = ((row.votos_2022 - row.votos_2018) / row.votos_2018) * 100;
  const pctStr = pct >= 0 ? `(+${pct.toFixed(1)}%)` : `(${pct.toFixed(1)}%)`;
  return `${votosStr} ${pctStr}`;
}

function variacaoAbsoluta(row: MunicipioComVariacao): number {
  return row.votos_2022 - row.votos_2018;
}

export default function MunicipiosTable({ data }: MunicipiosTableProps) {
  const [search, setSearch] = useState("");
  const [filtro, setFiltro] = useState<FiltroTendencia>("todos");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let list = data;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) => r.municipio.toLowerCase().includes(q));
    }
    if (filtro === "altas") list = [...list].sort((a, b) => variacaoAbsoluta(b) - variacaoAbsoluta(a));
    else if (filtro === "baixas") list = [...list].sort((a, b) => variacaoAbsoluta(a) - variacaoAbsoluta(b));
    return list;
  }, [data, search, filtro]);

  const toggleRow = useCallback((municipio: string) => {
    setExpandedId((prev) => (prev === municipio ? null : municipio));
  }, []);

  const chartDataFor = useCallback((row: MunicipioComVariacao) => {
    return [
      { ano: "2010", votos: row.votos_2010 },
      { ano: "2014", votos: row.votos_2014 },
      { ano: "2018", votos: row.votos_2018 },
      { ano: "2022", votos: row.votos_2022 },
    ];
  }, []);

  return (
    <div className="space-y-4">
      {/* Header: busca + filtro */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm md:flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Buscar município..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex w-full flex-wrap gap-2 md:w-auto">
          <button
            onClick={() => setFiltro("altas")}
            className={`w-full rounded-lg border px-3 py-1.5 text-sm font-medium transition md:w-auto ${
              filtro === "altas"
                ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Maiores Altas
          </button>
          <button
            onClick={() => setFiltro("baixas")}
            className={`w-full rounded-lg border px-3 py-1.5 text-sm font-medium transition md:w-auto ${
              filtro === "baixas"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Maiores Baixas
          </button>
          <button
            onClick={() => setFiltro("todos")}
            className={`w-full rounded-lg border px-3 py-1.5 text-sm font-medium transition md:w-auto ${
              filtro === "todos"
                ? "border-slate-300 bg-slate-100 text-slate-800"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            Todos
          </button>
        </div>
      </div>

      {/* Tabela */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <div className="w-full overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full min-w-[560px] text-left text-sm sm:min-w-[720px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80">
                <th className="w-10 px-3 py-2.5 font-medium text-slate-600 sm:px-4 sm:py-3"></th>
                <th className="px-3 py-2.5 font-medium text-slate-600 sm:px-4 sm:py-3">Município</th>
                <th className="hidden px-3 py-2.5 font-medium text-slate-600 text-right sm:table-cell sm:px-4 sm:py-3">2010</th>
                <th className="hidden px-3 py-2.5 font-medium text-slate-600 text-right sm:table-cell sm:px-4 sm:py-3">2014</th>
                <th className="px-3 py-2.5 font-medium text-slate-600 text-right sm:px-4 sm:py-3">2018</th>
                <th className="px-3 py-2.5 font-medium text-slate-600 text-right sm:px-4 sm:py-3">2022</th>
                <th className="px-3 py-2.5 font-medium text-slate-600 text-right sm:px-4 sm:py-3">Tendência</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const isExpanded = expandedId === row.municipio;
                return (
                  <React.Fragment key={row.municipio}>
                    <tr
                      onClick={() => toggleRow(row.municipio)}
                      className={`cursor-pointer border-b border-slate-100 transition hover:bg-slate-50/50 ${
                        isExpanded ? "bg-indigo-50/30" : ""
                      }`}
                    >
                      <td className="px-3 py-2.5 text-slate-400 sm:px-4 sm:py-3">
                        {isExpanded ? (
                          <ChevronDown />
                        ) : (
                          <ChevronRight />
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-medium text-slate-800 sm:px-4 sm:py-3">
                        {row.municipio}
                      </td>
                      <td className="hidden px-3 py-2.5 text-right tabular-nums text-slate-600 sm:table-cell sm:px-4 sm:py-3">
                        {formatVotos(row.votos_2010)}
                      </td>
                      <td className="hidden px-3 py-2.5 text-right tabular-nums text-slate-600 sm:table-cell sm:px-4 sm:py-3">
                        {formatVotos(row.votos_2014)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 sm:px-4 sm:py-3">
                        {formatVotos(row.votos_2018)}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-slate-600 sm:px-4 sm:py-3">
                        {formatVotos(row.votos_2022)}
                      </td>
                      <td className="px-3 py-2.5 text-right sm:px-4 sm:py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            variacaoAbsoluta(row) >= 0
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {formatTendencia(row)}
                        </span>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="border-b border-slate-200 bg-slate-50/30 p-0">
                          <div className="w-full border-t border-slate-100 p-2 py-3 md:p-6">
                            <p className="mb-2 px-2 text-xs font-medium text-slate-500 md:px-4">
                              Evolução de votos — {row.municipio}
                            </p>
                              <MunicipioChart
                                data={chartDataFor(row)}
                                tendencia={variacaoAbsoluta(row) >= 0 ? "alta" : "baixa"}
                              />
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
            Nenhum município encontrado.
          </div>
        )}
      </div>
    </div>
  );
}
