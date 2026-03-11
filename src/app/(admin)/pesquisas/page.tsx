"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ComponentCard from "@/components/common/ComponentCard";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ─── Mock Data ─────────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    title: "Intenção de Voto",
    value: "34,2%",
    trend: "+2,1",
    positive: true,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Rejeição",
    value: "12,8%",
    trend: "-1,3",
    positive: true,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    ),
  },
  {
    title: "Conhecimento",
    value: "78%",
    trend: "+5,2",
    positive: true,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "Sentimento Geral",
    value: "Positivo",
    trend: "+8%",
    positive: true,
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const VOZ_DAS_RUAS = [
  {
    id: 1,
    quote: "Quero alguém que trabalhe de verdade, não só prometa. O Lucas já mostrou que faz.",
    profile: "Homem, 45–54 anos, classe C",
    region: "Centro",
    highlight: true,
  },
  {
    id: 2,
    quote: "A saúde está um caos. Preciso ver projeto concreto, não discurso.",
    profile: "Mulher, 35–44 anos, classe D",
    region: "Bom Fim",
    highlight: false,
  },
  {
    id: 3,
    quote: "Não conheço bem o candidato, mas ouvi falar das emendas que trouxe.",
    profile: "Homem, 25–34 anos, classe B",
    region: "Partenon",
    highlight: false,
  },
  {
    id: 4,
    quote: "O problema é a corrupção. Quem vem de fora pode ser diferente.",
    profile: "Mulher, 55+ anos, classe C",
    region: "Restinga",
    highlight: true,
  },
];

const TAGS_POSITIVAS = ["Trabalho", "Transparência", "Emendas", "Saudável", "Acessível", "Proximidade"];
const TAGS_NEGATIVAS = ["Desconhecimento", "Oposição", "Mídia", "Tempo", "Promessas"];

const ENTREVISTAS = [
  { id: "E001", data: "03/03/2025", idade: "28", genero: "M", renda: "Classe B", bairro: "Bom Fim" },
  { id: "E002", data: "02/03/2025", idade: "52", genero: "F", renda: "Classe C", bairro: "Restinga" },
  { id: "E003", data: "02/03/2025", idade: "41", genero: "M", renda: "Classe D", bairro: "Centro" },
  { id: "E004", data: "01/03/2025", idade: "67", genero: "F", renda: "Classe C", bairro: "Partenon" },
  { id: "E005", data: "01/03/2025", idade: "35", genero: "M", renda: "Classe B", bairro: "Petrópolis" },
  { id: "E006", data: "28/02/2025", idade: "23", genero: "F", renda: "Classe D", bairro: "Lomba do Pinheiro" },
];

// ─── Options para gráficos ─────────────────────────────────────────────────

const lineChartOptions: ApexOptions = {
  chart: {
    fontFamily: "Outfit, sans-serif",
    type: "line",
    toolbar: { show: false },
    zoom: { enabled: false },
  },
  colors: ["#465FFF", "#22c55e", "#f59e0b"],
  stroke: { curve: "smooth", width: 2 },
  markers: { size: 0, hover: { size: 5 } },
  grid: {
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
  },
  xaxis: {
    type: "category",
    categories: ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out"],
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

const lineSeries = [
  { name: "Intenção de Voto (%)", data: [28, 29, 31, 30, 32, 33, 32, 34, 33, 34] },
  { name: "Conhecimento (%)", data: [65, 68, 70, 72, 74, 75, 76, 77, 77, 78] },
  { name: "Rejeição (%)", data: [16, 15, 14, 14, 13, 13, 13, 12, 13, 13] },
];

const radarChartOptions: ApexOptions = {
  chart: {
    type: "radar",
    toolbar: { show: false },
    fontFamily: "Outfit, sans-serif",
  },
  colors: ["#465FFF", "#94a3b8"],
  stroke: { width: 2 },
  fill: { opacity: 0.2 },
  markers: { size: 0 },
  xaxis: {
    categories: ["Confiança", "Proximidade", "Experiência", "Honestidade", "Propostas", "Liderança"],
  },
  yaxis: { show: false },
  legend: { position: "bottom" },
};

const radarSeries = [
  { name: "Candidato", data: [75, 68, 82, 79, 65, 71] },
  { name: "Concorrente A", data: [62, 72, 58, 65, 70, 64] },
];

// ─── Componente ────────────────────────────────────────────────────────────

export default function PesquisasPage() {
  const [activeTab, setActiveTab] = useState<"visao" | "qualitativa" | "entrevistas">("visao");

  const tabs = [
    { id: "visao" as const, label: "Visão Geral" },
    { id: "qualitativa" as const, label: "Pesquisa Qualitativa" },
    { id: "entrevistas" as const, label: "Entrevistas Base" },
  ];

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Pesquisas Eleitorais" />

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-800">
        <nav className="-mb-px flex flex-wrap gap-4" aria-label="Abas">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600 dark:border-indigo-500 dark:text-indigo-400"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Aba 1: Visão Geral */}
      {activeTab === "visao" && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STAT_CARDS.map((stat) => (
              <div
                key={stat.title}
                className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                    {stat.icon}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      stat.positive
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}
                  >
                    {stat.positive ? "↑" : "↓"} {stat.trend}
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold text-gray-800 dark:text-white/90">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{stat.title}</p>
              </div>
            ))}
          </div>

          {/* Gráfico Evolução Histórica */}
          <ComponentCard title="Evolução Histórica" desc="Intenção de voto, conhecimento e rejeição ao longo do tempo">
            <div className="min-h-[320px]">
              <ReactApexChart
                options={lineChartOptions}
                series={lineSeries}
                type="line"
                height={320}
              />
            </div>
          </ComponentCard>
        </div>
      )}

      {/* Aba 2: Pesquisa Qualitativa */}
      {activeTab === "qualitativa" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Gráfico Radar */}
            <ComponentCard title="Atributos de Imagem do Candidato" desc="Comparativo com concorrente principal">
              <div className="min-h-[340px]">
                <ReactApexChart
                  options={radarChartOptions}
                  series={radarSeries}
                  type="radar"
                  height={340}
                />
              </div>
            </ComponentCard>

            {/* Voz das Ruas */}
            <ComponentCard title="Voz das Ruas" desc="Citações de eleitores nas pesquisas qualitativas">
              <div className="space-y-4">
                {VOZ_DAS_RUAS.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 ${
                      item.highlight
                        ? "border-indigo-200 bg-indigo-50/50 dark:border-indigo-900/50 dark:bg-indigo-900/10"
                        : "border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-800/30"
                    }`}
                  >
                    <p className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                      &ldquo;{item.quote}&rdquo;
                    </p>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{item.profile}</span>
                      <span>{item.region}</span>
                    </div>
                    {item.highlight && (
                      <span className="mt-2 inline-block rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                        Dor principal
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </ComponentCard>
          </div>

          {/* Nuvens de Tags */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ComponentCard title="Temas Positivos" desc="Palavras mais citadas de forma positiva">
              <div className="flex flex-wrap gap-2">
                {TAGS_POSITIVAS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-green-100 px-3 py-1.5 text-sm font-medium text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </ComponentCard>
            <ComponentCard title="Temas Negativos" desc="Palavras mais citadas de forma negativa">
              <div className="flex flex-wrap gap-2">
                {TAGS_NEGATIVAS.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-red-100 px-3 py-1.5 text-sm font-medium text-red-800 dark:bg-red-900/30 dark:text-red-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </ComponentCard>
          </div>
        </div>
      )}

      {/* Aba 3: Entrevistas Base */}
      {activeTab === "entrevistas" && (
        <ComponentCard title="Entrevistas em Profundidade" desc="Base de entrevistas qualitativas">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">ID</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Data</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Idade</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Gênero</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Renda</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Bairro/Região</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Ação</th>
                </tr>
              </thead>
              <tbody>
                {ENTREVISTAS.map((row, idx) => (
                  <tr
                    key={row.id}
                    className={`border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/30 ${
                      idx % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-gray-50/50 dark:bg-gray-800/20"
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-white/90">{row.id}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.data}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.idade} anos</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.genero}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.renda}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{row.bairro}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="rounded-lg bg-indigo-100 px-3 py-1.5 text-xs font-medium text-indigo-700 transition hover:bg-indigo-200 dark:bg-indigo-900/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
                      >
                        Ver Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ComponentCard>
      )}
    </div>
  );
}
