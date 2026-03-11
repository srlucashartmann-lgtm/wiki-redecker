"use client";

import React, { useMemo, useState, useCallback } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";
import type { VotacaoRaw } from "./page";

// ─── Categorização por palavras-chave na ementa/descrição ───────────────────

type Categoria = "Economia" | "Agro" | "Segurança" | "Saúde" | "Meio Ambiente" | "Demografia" | "Administrativo";

const KEYWORDS: Record<Categoria, string[]> = {
  Economia: ["imposto", "tributár", "fiscal", "orçamento", "pis", "cofins", "receita", "despesa", "crédito", "dívida", "reforma tributária"],
  Agro: ["rural", "agricultura", "terra", "indígena", "marco temporal", "agrícola", "agronegócio", "floresta", "desmatamento", "mineração"],
  Segurança: ["armas", "desarmamento", "penal", "prisão", "polici", "segurança pública", "crime", "penal"],
  Saúde: ["saúde", "vacina", "imunização", "sus", "médico", "hospital", "epidemia", "pandemia", "medicamento"],
  "Meio Ambiente": ["ambiental", "licenciamento", "clima", "poluição", "biodiversidade", "sustentabilidade", "recursos naturais"],
  Demografia: ["homenagem", "cidadania", "título honorário", "comenda", "ordem"],
  Administrativo: ["requerimento", "retirada de pauta", "adiamento", "urgência", "pauta", "sessão"],
};

function categorizarPorTexto(texto: string): Categoria[] {
  if (!texto) return ["Administrativo"];
  const lower = texto.toLowerCase();
  const categorias: Categoria[] = [];

  for (const [cat, palavras] of Object.entries(KEYWORDS)) {
    if (palavras.some((p) => lower.includes(p))) {
      categorias.push(cat as Categoria);
    }
  }

  return categorias.length > 0 ? categorias : ["Administrativo"];
}

// ─── Extração de data e proposição ──────────────────────────────────────────

function extrairData(dataHoraSessao: string): string {
  const match = dataHoraSessao?.match(/^(\d{2}\/\d{2}\/\d{4})/);
  return match ? match[1] : "—";
}

function extrairProposicaoSigla(proposicaoResumo: string): string {
  const primeiraParte = proposicaoResumo?.split(" - ")[0] || "";
  return primeiraParte.replace(/\s*N[º°]\s*/gi, " ").trim() || "—";
}

function extrairEmenta(proposicaoResumo: string): string {
  const parts = proposicaoResumo?.split(" - ");
  return parts && parts.length > 1 ? parts.slice(1).join(" - ") : "";
}

function parseDataParaOrdenacao(dataStr: string): number {
  const [d, m, a] = dataStr.split("/").map(Number);
  if (!d || !m || !a) return 0;
  return new Date(a, m - 1, d).getTime();
}

// ─── Tipos ──────────────────────────────────────────────────────────────────

type Temperatura = "quente" | "medio" | "frio";

const PAUTAS_RADAR: { label: Categoria; temperatura: Temperatura }[] = [
  { label: "Economia", temperatura: "quente" },
  { label: "Agro", temperatura: "quente" },
  { label: "Segurança", temperatura: "quente" },
  { label: "Saúde", temperatura: "medio" },
  { label: "Meio Ambiente", temperatura: "medio" },
  { label: "Demografia", temperatura: "frio" },
  { label: "Administrativo", temperatura: "frio" },
];

const DOT_STYLES: Record<Temperatura, string> = {
  quente: "bg-red-500",
  medio: "bg-orange-400",
  frio: "bg-slate-400",
};

const PAGE_SIZE = 50;

// ─── Componente ─────────────────────────────────────────────────────────────

interface VotacoesDashboardProps {
  votacoesData: VotacaoRaw[];
}

export default function VotacoesDashboard({ votacoesData }: VotacoesDashboardProps) {
  const [busca, setBusca] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<Categoria | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(0);

  const toggleCategoriaFilter = useCallback((label: Categoria) => {
    setCategoriaFiltro((prev) => (prev === label ? null : label));
    setPaginaAtual(0);
  }, []);

  // Ordenar por data decrescente (mais recente primeiro)
  const votacoesOrdenadas = useMemo(() => {
    return [...votacoesData].sort((a, b) => {
      const da = parseDataParaOrdenacao(extrairData(a.data_hora_sessao));
      const db = parseDataParaOrdenacao(extrairData(b.data_hora_sessao));
      return db - da;
    });
  }, [votacoesData]);

  // KPIs
  const kpis = useMemo(() => {
    const total = votacoesData.length;
    const sim = votacoesData.filter((v) => v.voto?.toLowerCase() === "sim").length;
    const nao = votacoesData.filter((v) => v.voto?.toLowerCase() === "não" || v.voto?.toLowerCase() === "nao").length;
    const ausencias = votacoesData.filter(
      (v) =>
        v.voto === "---" ||
        v.voto?.toLowerCase() === "obstrução" ||
        v.voto?.toLowerCase() === "obstrucao" ||
        v.voto?.toLowerCase() === "secreto" ||
        !v.voto
    ).length;

    return [
      {
        title: "Total de Votos Registrados",
        value: total.toLocaleString("pt-BR"),
        icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        ),
      },
      {
        title: "Votos SIM",
        value: sim.toLocaleString("pt-BR"),
        icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        title: "Votos NÃO",
        value: nao.toLocaleString("pt-BR"),
        icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
      },
      {
        title: "Ausências / Obstruções",
        value: ausencias.toLocaleString("pt-BR"),
        icon: (
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
      },
    ];
  }, [votacoesData]);

  // Filtro por busca e categoria
  const votacoesFiltradas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return votacoesOrdenadas.filter((v) => {
      const dataStr = extrairData(v.data_hora_sessao);
      const sigla = extrairProposicaoSigla(v.proposicao_resumo);
      const ementa = extrairEmenta(v.proposicao_resumo);
      const textoCompleto = `${sigla} ${ementa}`.toLowerCase();

      const matchBusca = !termo || textoCompleto.includes(termo) || dataStr.includes(termo);
      const categorias = categorizarPorTexto(v.proposicao_resumo);
      const matchCategoria = !categoriaFiltro || categorias.includes(categoriaFiltro);

      return matchBusca && matchCategoria;
    });
  }, [votacoesOrdenadas, busca, categoriaFiltro]);

  const votacoesPagina = useMemo(() => {
    const inicio = paginaAtual * PAGE_SIZE;
    return votacoesFiltradas.slice(inicio, inicio + PAGE_SIZE);
  }, [votacoesFiltradas, paginaAtual]);

  const totalPaginas = Math.ceil(votacoesFiltradas.length / PAGE_SIZE);

  const getBadgeClasses = (voto: string) => {
    const v = voto?.toLowerCase() || "";
    if (v === "sim") return "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400";
    if (v === "não" || v === "nao") return "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400";
    return "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400";
  };

  const formatarVoto = (voto: string) => {
    if (voto === "---") return "Ausente";
    return voto || "—";
  };

  const inputClasses =
    "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500";

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Painel de Votações" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                {stat.icon}
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-800 dark:text-white/90">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Radar de Engajamento (Pautas em Destaque) */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 font-bold text-black dark:text-white text-title-md">Pautas em Destaque</h3>
        <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
          Clique para filtrar a tabela por categoria (baseada em palavras-chave na ementa)
        </p>
        <div className="flex flex-row flex-wrap gap-3 overflow-x-auto pb-1">
          {PAUTAS_RADAR.map((pauta) => {
            const isActive = categoriaFiltro === pauta.label;
            return (
              <button
                key={pauta.label}
                type="button"
                onClick={() => toggleCategoriaFilter(pauta.label)}
                className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors
                  bg-white border-gray-200 text-gray-700
                  hover:bg-gray-50 dark:bg-gray-900 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-800/80
                  ${isActive ? "border-brand-500 text-brand-500 bg-brand-50/50 dark:bg-brand-500/10 dark:border-brand-500 dark:text-brand-400" : ""}`}
              >
                <span className={`h-2 w-2 shrink-0 rounded-full ${DOT_STYLES[pauta.temperatura]}`} aria-hidden />
                <span>{pauta.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tabela de Votações */}
      <ComponentCard
        title="Votações do Mandato"
        desc="Histórico de votações na Câmara dos Deputados — 50 registros por página"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Busca rápida por ementa ou número do PL..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                setPaginaAtual(0);
              }}
              className={inputClasses}
            />
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
          <table className="w-full min-w-[700px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Data</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Proposição / Ementa</th>
                <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Voto</th>
              </tr>
            </thead>
            <tbody>
              {votacoesPagina.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    Nenhuma votação encontrada.
                  </td>
                </tr>
              ) : (
                votacoesPagina.map((row, idx) => {
                  const dataStr = extrairData(row.data_hora_sessao);
                  const sigla = extrairProposicaoSigla(row.proposicao_resumo);
                  const ementa = extrairEmenta(row.proposicao_resumo);
                  const ementaTruncada = ementa.length > 120 ? ementa.slice(0, 120) + "…" : ementa;

                  return (
                    <tr
                      key={`${row.data_hora_sessao}-${row.proposicao_resumo}-${idx}`}
                      className={`border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/30 ${
                        idx % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-gray-50/50 dark:bg-gray-800/20"
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">{dataStr}</td>
                      <td className="px-4 py-3">
                        <div>
                          <span className="block font-semibold text-gray-800 dark:text-white/90">{sigla}</span>
                          {ementaTruncada && (
                            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
                              {ementaTruncada}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${getBadgeClasses(row.voto)}`}
                        >
                          {formatarVoto(row.voto)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginação */}
        {totalPaginas > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Página {paginaAtual + 1} de {totalPaginas} ({votacoesFiltradas.length} registros)
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaginaAtual((p) => Math.max(0, p - 1))}
                disabled={paginaAtual === 0}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Anterior
              </button>
              <button
                type="button"
                onClick={() => setPaginaAtual((p) => Math.min(totalPaginas - 1, p + 1))}
                disabled={paginaAtual >= totalPaginas - 1}
                className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </ComponentCard>
    </div>
  );
}
