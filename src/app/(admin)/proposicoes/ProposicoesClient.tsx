"use client";

import {
  classificarTemperatura,
  type Proposicao,
  type ProposicoesKPIs,
  type TemperaturaStatus,
} from "@/lib/proposicoes";
import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

interface ProposicoesClientProps {
  proposicoes: Proposicao[];
  kpis: ProposicoesKPIs;
  chartData: { name: string; value: number }[];
  focoDeAtuacao: { tema: string; count: number }[];
  vitrineImpacto: Proposicao[];
}

const DONUT_COLORS = ["#4f46e5", "#059669", "#d97706", "#475569", "#64748b", "#94a3b8"];
const SIGLAS_ALTO_IMPACTO = new Set(["PL", "PEC", "PLP"]);

type FiltroPill = "todos" | "pls" | "quentes" | "frios";

const SearchIcon = () => (
  <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

function BadgeTemperatura({ status }: { status: string }) {
  const temp = classificarTemperatura(status);
  const styles: Record<TemperaturaStatus, string> = {
    quente: "bg-emerald-100 text-emerald-700",
    morno: "bg-amber-100 text-amber-700",
    frio: "bg-slate-200 text-slate-600",
  };
  const labels: Record<TemperaturaStatus, string> = {
    quente: "Quente",
    morno: "Morno",
    frio: "Frio",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[temp]}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${temp === "quente" ? "bg-emerald-500" : temp === "morno" ? "bg-amber-500" : "bg-slate-500"}`} />
      {labels[temp]}
    </span>
  );
}

export default function ProposicoesClient({
  proposicoes,
  kpis,
  chartData,
  focoDeAtuacao,
  vitrineImpacto,
}: ProposicoesClientProps) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filtroPill, setFiltroPill] = useState<FiltroPill>("todos");

  const donutData = useMemo(() => {
    if (!chartData.length) return [];
    const sorted = [...chartData].sort((a, b) => b.value - a.value);
    const top = sorted.slice(0, 5);
    const rest = sorted.slice(5);
    if (rest.length === 0) return top;
    const outrosTotal = rest.reduce((s, x) => s + x.value, 0);
    return [...top, { name: "Outros", value: outrosTotal }];
  }, [chartData]);

  const filtered = useMemo(() => {
    let result = proposicoes;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.siglaTipo.toLowerCase().includes(q) ||
          p.numeroAno.toLowerCase().includes(q) ||
          p.numero.toString().includes(q) ||
          p.ementa.toLowerCase().includes(q) ||
          (p.tema?.toLowerCase().includes(q) ?? false)
      );
    }

    if (filtroPill === "pls") {
      result = result.filter((p) => SIGLAS_ALTO_IMPACTO.has(p.siglaTipo));
    } else if (filtroPill === "quentes") {
      result = result.filter((p) => classificarTemperatura(p.statusAtual) === "quente");
    } else if (filtroPill === "frios") {
      result = result.filter((p) => classificarTemperatura(p.statusAtual) === "frio");
    }

    return result;
  }, [proposicoes, search, filtroPill]);

  const toggleRow = (id: number) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const pills: { value: FiltroPill; label: string }[] = [
    { value: "todos", label: "Todos" },
    { value: "pls", label: "Só PLs/PECs" },
    { value: "quentes", label: "Quentes" },
    { value: "frios", label: "Frios" },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs Executivos */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Total de Proposições</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{kpis.totalApresentadas}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Projetos de Alto Impacto (PL/PEC/PLP)</p>
          <p className="mt-2 text-3xl font-bold text-indigo-600">{kpis.projetosDeLei}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Taxa de Atividade / Status</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{kpis.taxaConversao}%</p>
          <p className="mt-1 text-xs text-slate-500">
            Tramitando: {kpis.tramitando} · Arquivadas: {kpis.arquivadas}
          </p>
        </div>
      </div>

      {/* Radar de Pautas + Donut (grid) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Foco de Atuação - BarChart horizontal */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Foco de Atuação</h3>
          <p className="mb-4 text-xs text-slate-500">
            Os 5 temas mais abordados em Projetos de Lei (PL/PEC/PLP)
          </p>
          <div className="h-[220px] min-h-[220px] w-full">
            {focoDeAtuacao.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Sem dados para o gráfico
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={focoDeAtuacao}
                  margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis
                    type="category"
                    dataKey="tema"
                    width={120}
                    tick={{ fontSize: 11, fill: "#475569" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "1px solid #e2e8f0",
                      borderRadius: "6px",
                      fontSize: "12px",
                    }}
                    formatter={(value: number | undefined) => [`${value ?? 0} projetos`, "Quantidade"]}
                  />
                  <Bar dataKey="count" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Donut por Tipo */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Distribuição por Tipo</h3>
          <div className="w-full h-[300px] md:h-[350px]">
            {donutData.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Sem dados
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="45%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    nameKey="name"
                    isAnimationActive
                  >
                    {donutData.map((entry, i) => (
                      <Cell
                        key={entry.name}
                        fill={DONUT_COLORS[i % DONUT_COLORS.length]}
                        stroke="white"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#ffffff",
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                      fontSize: "12px",
                      padding: "8px 12px",
                    }}
                    formatter={(value: number | undefined, name?: string) => [
                      `${value ?? 0} proposições`,
                      name ?? "",
                    ]}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-slate-600">{value}</span>
                    )}
                    wrapperStyle={{ paddingTop: "8px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Vitrine de Impacto */}
      {vitrineImpacto.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Projetos de Alto Impacto</h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {vitrineImpacto.map((p) => (
              <div
                key={p.id}
                className="flex flex-col rounded-lg border border-gray-100 bg-slate-50/50 p-4 transition hover:border-indigo-200 hover:bg-white"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-indigo-600">{p.siglaTipo} {p.numeroAno}</span>
                  <BadgeTemperatura status={p.statusAtual} />
                </div>
                {p.tema && (
                  <p className="mt-1 text-xs font-medium text-slate-500">{p.tema}</p>
                )}
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-700 line-clamp-3">
                  {p.ementa}
                </p>
                {p.urlDocumento && (
                  <a
                    href={p.urlDocumento}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLinkIcon />
                    Ver na Câmara
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela Interativa */}
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 md:flex-row md:flex-wrap md:items-center md:justify-between md:gap-4">
          <div className="flex flex-wrap gap-2">
            {pills.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFiltroPill(value)}
                className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition ${
                  filtroPill === value
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative w-full md:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </span>
            <input
              type="text"
              placeholder="Buscar por tema ou número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[400px]">
            <thead>
              <tr className="border-b border-gray-200 bg-slate-50/50">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Tipo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Número/Ano
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-12 text-center text-slate-500">
                    Nenhuma proposição encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <React.Fragment key={p.id}>
                    <tr
                      onClick={() => toggleRow(p.id)}
                      className="cursor-pointer border-b border-gray-100 transition hover:bg-slate-50/50"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-800">
                        {p.siglaTipo}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {p.numeroAno}
                      </td>
                      <td className="px-4 py-3">
                        <BadgeTemperatura status={p.statusAtual} />
                      </td>
                    </tr>
                    {expandedId === p.id && (
                      <tr>
                        <td colSpan={3} className="bg-slate-50/30 px-4 py-0">
                          <div className="border-l-4 border-indigo-500 bg-slate-50 p-4">
                            <p className="text-sm leading-relaxed text-slate-800">
                              {p.ementa}
                            </p>
                            {p.urlDocumento && (
                              <a
                                href={p.urlDocumento}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-white px-3 py-2 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLinkIcon />
                                Ver na Câmara
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
