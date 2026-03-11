"use client";

import React, { useMemo } from "react";
import type { ProfileData } from "@/lib/perfil-types";
import { LEGISLATURA_ANOS } from "@/lib/perfil-types";

interface TimelineItem {
  anoInicio: number;
  anoFim: number;
  periodo: string;
  cargo: string;
  partido?: string;
  uf?: string;
  sortKey: number;
}

function calcularIdade(dataNascimento?: string): number | null {
  if (!dataNascimento) return null;
  const nasc = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nasc.getFullYear();
  const m = hoje.getMonth() - nasc.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--;
  return idade;
}

function formatarDataNascimento(s?: string): string {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export default function ProfileDashboard({ profileData }: { profileData: ProfileData }) {
  const { biografia, profissoes, ocupacoes, historicoMandatos, mandatosExternos } = profileData;

  const timeline = useMemo(() => {
    const items: TimelineItem[] = [];

    const legisVistas = new Set<number>();
    for (const h of historicoMandatos) {
      const id = h.idLegislatura ?? 0;
      if (id && !legisVistas.has(id)) {
        legisVistas.add(id);
        const anos = LEGISLATURA_ANOS[id] ?? { inicio: id, fim: id + 4 };
        items.push({
          anoInicio: anos.inicio,
          anoFim: anos.fim,
          periodo: `${anos.inicio}–${anos.fim}`,
          cargo: "Deputado Federal",
          partido: h.siglaPartido,
          uf: h.siglaUf,
          sortKey: anos.inicio,
        });
      }
    }

    for (const m of mandatosExternos) {
      const ini = typeof m.anoInicio === "string" ? parseInt(m.anoInicio, 10) : (m.anoInicio ?? 0);
      const fim = typeof m.anoFim === "string" ? parseInt(m.anoFim, 10) : (m.anoFim ?? ini);
      items.push({
        anoInicio: ini,
        anoFim: fim,
        periodo: fim > ini ? `${ini}–${fim}` : String(ini),
        cargo: m.cargo ?? "Mandato",
        partido: m.siglaPartidoEleicao,
        uf: m.siglaUf ?? undefined,
        sortKey: ini,
      });
    }

    return items.sort((a, b) => a.sortKey - b.sortKey);
  }, [historicoMandatos, mandatosExternos]);

  const nome = biografia.ultimoStatus?.nome ?? biografia.nomeCivil ?? "Parlamentar";
  const idade = calcularIdade(biografia.dataNascimento);
  const naturalidade = [biografia.municipioNascimento, biografia.ufNascimento].filter(Boolean).join(", ") || "-";

  const badges = useMemo(() => {
    const list: string[] = [];
    for (const p of profissoes) {
      if (p.titulo && p.titulo !== "Profissão não declarada") list.push(p.titulo);
    }
    for (const o of ocupacoes) {
      if (o.titulo) list.push(o.titulo);
    }
    return list;
  }, [profissoes, ocupacoes]);

  const temResumo = Boolean(biografia.resumo && String(biografia.resumo).trim().length > 0);

  return (
    <div className="space-y-6">
      {/* A. Header do Dossiê */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="p-6 sm:p-8">
          <h2 className="font-bold text-gray-900 dark:text-white text-title-sm">
            {nome}
          </h2>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 dark:text-gray-400">
            {biografia.dataNascimento && (
              <span>
                {formatarDataNascimento(biografia.dataNascimento)}
                {idade != null && ` (${idade} anos)`}
              </span>
            )}
            {naturalidade !== "-" && (
              <span>Natural de {naturalidade}</span>
            )}
          </div>
          {badges.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {badges.map((b) => (
                <span
                  key={b}
                  className="rounded-md bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-700 dark:bg-brand-500/15 dark:text-brand-400"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* B. Linha do Tempo Política */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
          <h3 className="font-semibold text-gray-800 dark:text-white/90 text-theme-xl">
            Linha do Tempo Política
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Trajetória legislativa e mandatos
          </p>
        </div>
        <div className="p-6">
          <div className="relative pl-6">
            {/* Linha vertical */}
            <div
              className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-gray-700"
              aria-hidden
            />
            <ul className="space-y-6">
              {timeline.map((item, idx) => (
                <li key={`${item.periodo}-${item.cargo}-${idx}`} className="relative flex gap-4">
                  {/* Dot */}
                  <div
                    className="absolute left-0 top-1.5 h-3 w-3 -translate-x-[5px] rounded-full bg-brand-500 ring-4 ring-white dark:ring-gray-900"
                    aria-hidden
                  />
                  <div className="flex-1 pb-2">
                    <p className="font-bold text-gray-800 dark:text-white/90">
                      {item.periodo}
                    </p>
                    <p className="mt-0.5 text-gray-700 dark:text-gray-300">
                      {item.cargo}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.partido && (
                        <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                          {item.partido}
                        </span>
                      )}
                      {item.uf && (
                        <span className="rounded border border-gray-200 bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400">
                          {item.uf}
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* C. Texto Biográfico (se houver resumo) */}
      {temResumo && (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800">
            <h3 className="font-semibold text-gray-800 dark:text-white/90 text-theme-xl">
              Biografia e Atuação
            </h3>
          </div>
          <div className="px-6 py-5">
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              {biografia.resumo}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
