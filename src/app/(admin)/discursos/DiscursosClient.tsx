"use client";

import NuvemPalavrasCard from "@/components/discursos/NuvemPalavrasCard";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { useModal } from "@/hooks/useModal";
import type { Discurso, DiscursosKPIs } from "@/lib/discursos";
import React, { useMemo, useState } from "react";

interface DiscursosClientProps {
  discursos: Discurso[];
  kpis: DiscursosKPIs;
  error: string | null;
}

const TEMAS_ESTRATEGICOS = [
  "Pacto Federativo",
  "Economia",
  "Saúde",
  "Infraestrutura",
  "Agro",
  "Educação",
  "Impostos",
];

function extractAnos(discursos: Discurso[]): number[] {
  const anos = new Set<number>();
  for (const d of discursos) {
    const match = d.data_bruta.match(/^(\d{4})/);
    if (match) anos.add(parseInt(match[1], 10));
  }
  return Array.from(anos).sort((a, b) => b - a);
}

function matchTema(texto: string, tema: string): boolean {
  const t = texto.toLowerCase();
  const palavra = tema.toLowerCase();
  return t.includes(palavra);
}

const SearchIcon = () => (
  <svg
    className="h-4 w-4 text-slate-400"
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
);

const CopyIcon = () => (
  <svg
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const CloseIcon = () => (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = ({ className = "" }: { className?: string }) => (
  <svg className={`h-5 w-5 transition-transform ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
  </svg>
);

export default function DiscursosClient({
  discursos,
  kpis,
  error,
}: DiscursosClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedDiscurso, setSelectedDiscurso] = useState<Discurso | null>(null);
  const [copied, setCopied] = useState(false);
  const [discursoExpanded, setDiscursoExpanded] = useState(false);
  const { isOpen, openModal, closeModal } = useModal();

  const anosDisponiveis = useMemo(() => extractAnos(discursos), [discursos]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedTheme !== null || selectedYear !== null;

  const handleLimparFiltros = () => {
    setSearchQuery("");
    setSelectedTheme(null);
    setSelectedYear(null);
  };

  const filtered = useMemo(() => {
    let result = discursos;

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.resumo_evento.toLowerCase().includes(q) ||
          d.conteudo_completo.toLowerCase().includes(q)
      );
    }

    if (selectedYear) {
      const y = selectedYear;
      result = result.filter((d) => d.data_bruta.startsWith(y));
    }

    if (selectedTheme) {
      result = result.filter(
        (d) =>
          matchTema(d.resumo_evento, selectedTheme) ||
          matchTema(d.conteudo_completo, selectedTheme)
      );
    }

    return result;
  }, [discursos, searchQuery, selectedYear, selectedTheme]);

  const handleOpenDiscurso = (d: Discurso) => {
    setSelectedDiscurso(d);
    setCopied(false);
    setDiscursoExpanded(false);
    openModal();
  };

  const handleCloseModal = () => {
    closeModal();
    setSelectedDiscurso(null);
  };

  const handleCopy = async () => {
    if (!selectedDiscurso) return;
    try {
      await navigator.clipboard.writeText(selectedDiscurso.conteudo_completo);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (error) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="text-amber-800">{error}</p>
        <p className="mt-2 text-sm text-amber-600">
          Verifique se a pasta{" "}
          <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">
            data/federal/discursos
          </code>{" "}
          existe e contém arquivos .md
        </p>
      </div>
    );
  }

  if (discursos.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center shadow-sm">
        <p className="text-slate-600">Nenhum discurso encontrado.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Nuvem de Palavras */}
      <NuvemPalavrasCard
        discursosFiltrados={filtered}
        onPalavraClick={(palavra) => setSearchQuery(palavra)}
      />

      {/* Cabeçalho Analítico */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:col-span-1">
          <p className="text-sm font-medium text-slate-500">
            Total de Pronunciamentos
          </p>
          <p className="mt-2 text-4xl font-bold text-slate-800">
            {kpis.total}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:col-span-1">
          <p className="text-sm font-medium text-slate-500">Última Fala</p>
          <p className="mt-2 text-2xl font-bold text-slate-800">
            {kpis.ultimo_data ?? "—"}
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:col-span-2">
          <p className="text-sm font-medium text-slate-500 mb-4">Radar de Temas</p>
          <div className="flex flex-wrap gap-2">
            {TEMAS_ESTRATEGICOS.map((tema) => (
              <button
                key={tema}
                type="button"
                onClick={() => setSelectedTheme((prev) => (prev === tema ? null : tema))}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  selectedTheme === tema
                    ? "bg-indigo-600 text-white"
                    : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                {tema}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Barra de Filtros Avançada */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
        <div className="relative flex-1 min-w-0">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Buscar palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear ?? ""}
            onChange={(e) => setSelectedYear(e.target.value || null)}
            className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Todos os Anos</option>
            {anosDisponiveis.map((ano) => (
              <option key={ano} value={String(ano)}>
                {ano}
              </option>
            ))}
          </select>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleLimparFiltros}
              className="h-11 rounded-lg border border-gray-200 bg-white px-4 text-sm text-slate-600 outline-none transition hover:bg-slate-50 hover:text-slate-800"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Linha do Tempo */}
      <div className="relative ml-3 border-l-2 border-indigo-200 pl-8">
        <div className="space-y-0">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white py-12 text-center shadow-sm">
              <p className="text-slate-600">Nenhum discurso encontrado com estes filtros.</p>
            </div>
          ) : (
            filtered.map((d) => (
              <div key={d.id} className="relative pb-8 last:pb-0">
                <div
                  className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-indigo-600"
                  aria-hidden
                />
                <button
                  type="button"
                  onClick={() => handleOpenDiscurso(d)}
                  className="group w-full cursor-pointer rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-all hover:shadow-md"
                >
                  <p className="text-sm text-slate-500">{d.data_formatada}</p>
                  <p className="mt-1 font-semibold text-slate-800 line-clamp-1">
                    {d.resumo_evento.slice(0, 80)}
                    {d.resumo_evento.length > 80 ? "…" : ""}
                  </p>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-600">
                    {d.resumo_evento}
                  </p>
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal Leitor (estilo Medium/Substack) */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        showCloseButton={false}
        className="m-4 max-h-[90vh] w-full max-w-3xl overflow-hidden sm:m-6"
      >
        {selectedDiscurso && (
          <div className="flex max-h-[90vh] flex-col bg-white">
            {/* Cabeçalho: Copiar + Fechar */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 px-8 py-4">
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopy}
                startIcon={<CopyIcon />}
              >
                {copied ? "Copiado!" : "Copiar Texto"}
              </Button>
              <button
                type="button"
                onClick={handleCloseModal}
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="Fechar"
              >
                <CloseIcon />
              </button>
            </div>
            {/* Corpo: resumo + sanfona */}
            <div className="flex-1 overflow-y-auto px-8 py-8 sm:px-12 sm:py-10">
              <p className="text-sm font-medium text-slate-500">
                {selectedDiscurso.data_formatada}
              </p>
              <p className="mt-2 text-base font-medium leading-snug text-slate-800">
                {selectedDiscurso.resumo_evento}
              </p>
              {/* Sanfona: discurso completo */}
              <div className="mt-6 border-t border-gray-200 pt-6">
                <button
                  type="button"
                  onClick={() => setDiscursoExpanded((prev) => !prev)}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-gray-200 bg-slate-50/50 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <span>{discursoExpanded ? "Ocultar" : "Ver"} discurso completo</span>
                  <ChevronDownIcon className={discursoExpanded ? "rotate-180" : ""} />
                </button>
                {discursoExpanded && (
                  <div className="mt-4 max-w-none text-base leading-relaxed text-slate-800">
                    {selectedDiscurso.conteudo_completo.split(/\n\n+/).map((p, i) =>
                      p.trim() ? (
                        <p key={i} className="mb-4">
                          {p.trim()}
                        </p>
                      ) : null
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
