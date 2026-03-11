"use client";

import React, { useMemo, useState } from "react";
import type { ArticulacaoData, Comissao, FrenteParlamentar, Evento } from "@/lib/articulacao-types";

function formatarDataHora(iso?: string): string {
  if (!iso) return "-";
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function localEvento(e: Evento): string {
  if (e.localExterno) return e.localExterno;
  if (e.localCamara?.nome) return e.localCamara.nome;
  return "";
}

function condicaoDestaque(titulo?: string): boolean {
  const t = (titulo || "").toLowerCase();
  return t.includes("titular") || t.includes("presidente") || t.includes("vice");
}

const IconBuilding = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
  </svg>
);

const IconStar = () => (
  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
  </svg>
);

const IconMaleta = () => (
  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" />
  </svg>
);

const IconSearch = () => (
  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

export default function ArticulacaoDashboard({ data }: { data: ArticulacaoData }) {
  const { comissoes, frentes, eventos } = data;
  const [buscaFrentes, setBuscaFrentes] = useState("");

  const totalTitular = useMemo(
    () => comissoes.filter((c) => condicaoDestaque(c.titulo)).length,
    [comissoes]
  );

  const frentesFiltradas = useMemo(() => {
    if (!buscaFrentes.trim()) return frentes;
    const q = buscaFrentes.trim().toLowerCase();
    return frentes.filter((f) => (f.titulo || "").toLowerCase().includes(q));
  }, [frentes, buscaFrentes]);

  const eventosOrdenados = useMemo(
    () =>
      [...eventos].sort((a, b) => {
        const da = a.dataHoraInicio || "";
        const db = b.dataHoraInicio || "";
        return db.localeCompare(da);
      }),
    [eventos]
  );

  return (
    <div className="space-y-6">
      {/* 1. KPIs de Poder (Stat Cards) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <IconBuilding />
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-800 dark:text-white/90">
            {comissoes.length}
            <span className="ml-1 text-base font-normal text-brand-600 dark:text-brand-400">
              ({totalTitular} titular{totalTitular !== 1 ? "es" : ""})
            </span>
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Total de Comissões
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-800 dark:text-white/90">
            {frentes.length}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Frentes Parlamentares
          </p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-800 dark:text-white/90">
            {eventos.length}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Eventos Oficiais
          </p>
        </div>
      </div>

      {/* 2. Comissões como Cards de Influência (Grid) */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <h2 className="font-semibold text-gray-800 dark:text-white/90 text-theme-xl">
            Assentos em Comissões
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Mapa de poder · Titularidade e suplência
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {comissoes.length === 0 ? (
              <p className="col-span-full text-sm text-gray-500 dark:text-gray-400">
                Nenhuma comissão encontrada.
              </p>
            ) : (
              comissoes.map((c) => {
                const destaque = condicaoDestaque(c.titulo);
                const nome = c.nomePublicacao || c.nomeOrgao || "-";
                return (
                  <div
                    key={c.idOrgao ?? nome}
                    className={`relative rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md dark:bg-white/[0.02] dark:border-gray-800 ${
                      destaque
                        ? "border-t-4 border-t-brand-500 border-gray-200 dark:border-gray-800"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        <IconMaleta />
                      </div>
                      {destaque && (
                        <span className="shrink-0 text-brand-500" title="Titular">
                          <IconStar />
                        </span>
                      )}
                    </div>
                    <p className="mt-3 font-medium text-gray-800 dark:text-white/90 line-clamp-3">
                      {nome}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span
                        className={
                          destaque
                            ? "rounded-md bg-brand-500 px-2 py-0.5 text-xs font-medium text-white"
                            : "rounded-md border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"
                        }
                      >
                        {c.titulo ?? "-"}
                      </span>
                      {c.siglaOrgao && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {c.siglaOrgao}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 3. Frentes Parlamentares - Radar Interativo */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <h2 className="font-semibold text-gray-800 dark:text-white/90 text-theme-xl">
            Frentes Parlamentares (Defesa de Setores)
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Radar de nichos e alcance parlamentar
          </p>
        </div>
        <div className="space-y-4 p-6">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500">
              <IconSearch />
            </span>
            <input
              type="text"
              placeholder="Buscar frente (ex: Agro, Armas, Autistas...)"
              value={buscaFrentes}
              onChange={(e) => setBuscaFrentes(e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500"
            />
          </div>
          <div className="max-h-[320px] overflow-y-auto rounded-lg border border-gray-100 p-4 dark:border-gray-800">
            <div className="flex flex-wrap gap-2">
              {frentesFiltradas.length === 0 ? (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhuma frente encontrada.
                </span>
              ) : (
                frentesFiltradas.map((f) => (
                  <span
                    key={f.id ?? f.titulo}
                    className="inline-block cursor-default rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition-all hover:bg-brand-500 hover:text-white dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-brand-500 dark:hover:text-white"
                  >
                    {f.titulo ?? "-"}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Eventos - Linha do Tempo de Ação (Vertical Timeline) */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] overflow-hidden">
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <h2 className="font-semibold text-gray-800 dark:text-white/90 text-theme-xl">
            Agenda e Eventos Institucionais
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Linha do tempo de presença e atividade
          </p>
        </div>
        <div className="p-6">
          <div className="relative pl-6">
            <div
              className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-brand-200 dark:bg-brand-900/40"
              aria-hidden
            />
            {eventosOrdenados.length === 0 ? (
              <p className="py-8 text-sm text-gray-500 dark:text-gray-400">
                Nenhum evento encontrado.
              </p>
            ) : (
              <ul className="space-y-6">
                {eventosOrdenados.map((e, idx) => (
                  <li key={e.id ?? idx} className="relative flex gap-4">
                    <div
                      className="absolute left-0 top-1 h-3 w-3 -translate-x-[5px] rounded-full bg-brand-500 ring-4 ring-white dark:ring-gray-900"
                      aria-hidden
                    />
                    <div className="flex-1 pb-2">
                      <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                        {formatarDataHora(e.dataHoraInicio)}
                      </p>
                      <p className="mt-0.5 font-semibold text-gray-800 dark:text-white/90">
                        {e.descricao ?? e.descricaoTipo ?? "-"}
                      </p>
                      {localEvento(e) && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                          {localEvento(e)}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
