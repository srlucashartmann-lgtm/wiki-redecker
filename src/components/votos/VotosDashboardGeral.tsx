"use client";

import React, { useMemo } from "react";
import type { AnoVotos, MunicipioComVariacao } from "@/lib/data";
import EvolucaoVotosChart from "@/components/charts/EvolucaoVotosChart";
import DistribuicaoVotosPie from "@/components/charts/DistribuicaoVotosPie";

const TOTAL_MUNICIPIOS_RS = 497;

function formatVotos(n: number) {
  return n.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
}

interface VotosDashboardGeralProps {
  evolucaoGeral: AnoVotos[];
  municipios: MunicipioComVariacao[];
}

export default function VotosDashboardGeral({
  evolucaoGeral,
  municipios,
}: VotosDashboardGeralProps) {
  const metrics = useMemo(() => {
    const total2022 = municipios.reduce((s, m) => s + m.votos_2022, 0);
    const total2018 = municipios.reduce((s, m) => s + m.votos_2018, 0);
    const capilaridade = municipios.filter((m) => m.votos_2022 > 0).length;
    const top5 = [...municipios].sort((a, b) => b.votos_2022 - a.votos_2022).slice(0, 5);
    const top5Sum = top5.reduce((s, m) => s + m.votos_2022, 0);
    const concentracao = total2022 > 0 ? (top5Sum / total2022) * 100 : 0;
    const principal = top5[0];
    const crescimento =
      total2018 > 0 ? ((total2022 - total2018) / total2018) * 100 : 0;
    const top5Perdas = [...municipios]
      .filter((m) => m.votos_2022 - m.votos_2018 < 0)
      .sort((a, b) => (a.votos_2022 - a.votos_2018) - (b.votos_2022 - b.votos_2018))
      .slice(0, 5);

    return {
      total2022,
      total2018,
      crescimento,
      capilaridade,
      concentracao,
      principal,
      top5,
      top5Perdas,
    };
  }, [municipios]);

  return (
    <div className="space-y-6">
      {/* 1. Linha de KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Votos Totais 2022</p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {formatVotos(metrics.total2022)}
          </p>
          {metrics.total2018 > 0 && (
            <span
              className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                metrics.crescimento >= 0
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {metrics.crescimento >= 0 ? "+" : ""}
              {metrics.crescimento.toFixed(1)}% vs 2018
            </span>
          )}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Municípios Alcançados
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {metrics.capilaridade}
            <span className="text-base font-normal text-slate-500">
              {" "}
              de {TOTAL_MUNICIPIOS_RS} cidades
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Dependência Top 5
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-800">
            {metrics.concentracao.toFixed(1)}%
            <span className="text-base font-normal text-slate-500">
              {" "}
              dos votos
            </span>
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Principal Reduto</p>
          <p className="mt-1 text-xl font-bold text-slate-800">
            {metrics.principal?.municipio ?? "—"}
          </p>
          <p className="mt-0.5 text-sm text-slate-600">
            {metrics.principal
              ? `${formatVotos(metrics.principal.votos_2022)} votos`
              : "—"}
          </p>
        </div>
      </div>

      {/* 2. Gráfico de Evolução */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-sm font-semibold text-slate-700">
          Evolução Total (2010–2022)
        </h3>
        <EvolucaoVotosChart data={evolucaoGeral} />
      </div>

      {/* 3. Grid de 3 colunas */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Coluna 1: Gráfico de Rosca */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Distribuição de Votos 2022
          </h3>
          <DistribuicaoVotosPie municipios={municipios} />
        </div>

        {/* Coluna 2: Fortalezas */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">
            Fortalezas
          </h3>
          <ul className="space-y-2">
            {metrics.top5.map((m, i) => (
              <li
                key={m.municipio}
                className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0"
              >
                <span className="text-sm font-medium text-slate-700">
                  {i + 1}. {m.municipio}
                </span>
                <span className="tabular-nums text-sm text-slate-600">
                  {formatVotos(m.votos_2022)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Coluna 3: Alertas */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-700">Alertas</h3>
          <ul className="space-y-2">
            {metrics.top5Perdas.map((m, i) => {
              const diff = m.votos_2022 - m.votos_2018;
              return (
                <li
                  key={m.municipio}
                  className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-sm font-medium text-slate-700">
                    {i + 1}. {m.municipio}
                  </span>
                  <span className="tabular-nums text-sm text-red-600">
                    {formatVotos(diff)}
                  </span>
                </li>
              );
            })}
            {metrics.top5Perdas.length === 0 && (
              <li className="text-sm text-slate-500">
                Nenhuma cidade com queda significativa.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
