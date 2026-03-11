"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import Link from "next/link";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ─── Mock Data ─────────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    title: "Votos Totais (2022)",
    value: "119.992",
    badge: "+15% vs 2018",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Cota Parlamentar (Mês Atual)",
    value: "R$ 24.500",
    badge: "12% abaixo da média",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Frentes & Comissões",
    value: "42",
    badge: "Titular CCJ",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Aprovação Atual",
    value: "48%",
    badge: "Estável",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const CIDADES_VOTOS = [
  { cidade: "Porto Alegre", votos2018: 18500, votos2022: 22100 },
  { cidade: "Caxias do Sul", votos2018: 14200, votos2022: 16800 },
  { cidade: "Pelotas", votos2018: 9800, votos2022: 11200 },
  { cidade: "Canoas", votos2018: 8700, votos2022: 10400 },
  { cidade: "Santa Maria", votos2018: 7200, votos2022: 8900 },
];

const PAUTAS_QUENTES = [
  { label: "Segurança Pública" },
  { label: "Aumento de Impostos" },
  { label: "Agro / Marco Temporal" },
];

const ULTIMAS_VOTACOES = [
  { data: "09/03/2026", pl: "PL 2.230/2023", voto: "ABSTENÇÃO" },
  { data: "05/03/2026", pl: "PL 3.729/2004", voto: "SIM" },
  { data: "28/02/2026", pl: "PEC 15/2022", voto: "NÃO" },
  { data: "18/12/2025", pl: "PL 3.877/2020", voto: "SIM" },
  { data: "10/11/2025", pl: "PL 2.378/2023", voto: "NÃO" },
];

const ACESSO_RAPIDO = [
  { label: "Raio-X Eleitoral", path: "/dashboard" },
  { label: "Pesquisas", path: "/pesquisas" },
  { label: "Histórico de Votações", path: "/votacoes" },
  { label: "Transparência CEAP", path: "/transparencia" },
  { label: "Perfil & Coerência", path: "/perfil" },
  { label: "Força de Articulação", path: "/articulacao" },
];

const barChartOptions: ApexOptions = {
  chart: {
    fontFamily: "Outfit, sans-serif",
    type: "bar",
    toolbar: { show: false },
  },
  plotOptions: {
    bar: { horizontal: false, columnWidth: "55%", borderRadius: 4 },
  },
  colors: ["#465FFF", "#12b76a"],
  dataLabels: { enabled: false },
  grid: {
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    categories: CIDADES_VOTOS.map((c) => c.cidade),
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: { style: { colors: "#6B7280", fontSize: "12px" } },
    min: 0,
  },
  legend: { position: "top", horizontalAlign: "right" },
  tooltip: { shared: true, intersect: false },
};

const barSeries = [
  { name: "2018", data: CIDADES_VOTOS.map((c) => c.votos2018) },
  { name: "2022", data: CIDADES_VOTOS.map((c) => c.votos2022) },
];

export default function CentroComando() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white/90">
          Centro de Comando
        </h1>
      </div>

      {/* 1. KPIs do Mandato */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STAT_CARDS.map((stat) => (
          <div
            key={stat.title}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                {stat.icon}
              </div>
              <span className="rounded-full bg-success-100 px-2.5 py-0.5 text-xs font-medium text-success-700 dark:bg-success-900/30 dark:text-success-400">
                {stat.badge}
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-800 dark:text-white/90">
              {stat.value}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* 2. Meio: Gráfico + Termômetro */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-2">
          <h2 className="font-semibold text-gray-800 dark:text-white/90 text-theme-xl">
            Raio-X Resumido
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Evolução de votos nas 5 maiores cidades base
          </p>
          <div className="mt-4 min-h-[280px]">
            <ReactApexChart
              options={barChartOptions}
              series={barSeries}
              type="bar"
              height={280}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="font-semibold text-gray-800 dark:text-white/90 text-theme-xl">
            Termômetro de Pautas
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Pautas mais quentes no momento
          </p>
          <ul className="mt-4 space-y-3">
            {PAUTAS_QUENTES.map((p) => (
              <li
                key={p.label}
                className="flex items-center gap-2 rounded-lg border-l-4 border-red-500 bg-red-50/50 px-3 py-2 dark:bg-red-900/10 dark:border-red-600"
              >
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {p.label}
                </span>
              </li>
            ))}
          </ul>
          <Link
            href="/votacoes"
            className="mt-4 inline-flex items-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300"
          >
            Ver todas as votações
            <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* 3. Base: Últimas Votações + Acesso Rápido */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-white/[0.03] lg:col-span-2">
          <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-800">
            <h2 className="font-semibold text-gray-800 dark:text-white/90 text-theme-xl">
              Últimas Votações do Plenário
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Data
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Proposição
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Voto
                  </th>
                </tr>
              </thead>
              <tbody>
                {ULTIMAS_VOTACOES.map((row, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/30"
                  >
                    <td className="whitespace-nowrap px-6 py-4 text-gray-600 dark:text-gray-400">
                      {row.data}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 dark:text-white/90">
                      {row.pl}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                          row.voto === "SIM"
                            ? "bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400"
                            : row.voto === "NÃO"
                            ? "bg-error-100 text-error-700 dark:bg-error-900/30 dark:text-error-400"
                            : "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400"
                        }`}
                      >
                        {row.voto}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <h2 className="font-semibold text-gray-800 dark:text-white/90 text-theme-xl">
            Acesso Rápido
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Navegação direta
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {ACESSO_RAPIDO.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-gray-800 dark:bg-gray-800/30 dark:hover:border-brand-800 dark:hover:bg-brand-500/10"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {item.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
