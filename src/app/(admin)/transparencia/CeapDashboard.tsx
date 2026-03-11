"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import ComponentCard from "@/components/common/ComponentCard";
import type { CeapGasto } from "@/lib/ceap";

const ReactApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MESES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function formatReais(n: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
    minimumFractionDigits: 0,
  }).format(n);
}

function formatReaisCell(n: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);
}

function abreviarTipo(s: string, max = 35) {
  if (s.length <= max) return s;
  return s.slice(0, max - 3) + "...";
}

interface CeapDashboardProps {
  gastos: CeapGasto[];
}

export default function CeapDashboard({ gastos }: CeapDashboardProps) {
  const [busca, setBusca] = useState("");

  const valor = (g: CeapGasto) => g.valorLiquido ?? g.valorDocumento ?? 0;

  const { total, maiorCategoria, mesMaiorGasto, mediaMensal, porTipo, porMesAno, tabelaOrdenada } =
    useMemo(() => {
      const totalGasto = gastos.reduce((s, g) => s + valor(g), 0);

      const porTipoMap = new Map<string, number>();
      for (const g of gastos) {
        const key = g.tipoDespesa || "Outros";
        porTipoMap.set(key, (porTipoMap.get(key) ?? 0) + valor(g));
      }
      const porTipo = Array.from(porTipoMap.entries())
        .map(([name, value]) => ({ name: abreviarTipo(name, 40), value }))
        .sort((a, b) => b.value - a.value);

      const porMesMap = new Map<string, number>();
      for (const g of gastos) {
        const key = `${g.ano}-${String(g.mes).padStart(2, "0")}`;
        porMesMap.set(key, (porMesMap.get(key) ?? 0) + valor(g));
      }
      const porMesAno = Array.from(porMesMap.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([periodo, value]) => {
          const [y, m] = periodo.split("-");
          const mesIdx = parseInt(m, 10) - 1;
          const label = `${MESES[mesIdx]}/${y}`;
          return { x: label, y: value };
        });

      const maiorCat = porTipo[0];
      const maiorMes = porMesAno.reduce(
        (max, p) => (p.y > (max?.y ?? 0) ? p : max),
        null as { x: string; y: number } | null
      );

      const mesesUnicos = new Set(porMesAno.map((p) => p.x)).size;
      const mediaMensal = mesesUnicos > 0 ? totalGasto / mesesUnicos : 0;

      const tabelaOrdenada = [...gastos].sort((a, b) => {
        const da = a.dataDocumento || `${a.ano}-${String(a.mes).padStart(2, "0")}-01`;
        const db = b.dataDocumento || `${b.ano}-${String(b.mes).padStart(2, "0")}-01`;
        return db.localeCompare(da);
      });

      return {
        total: totalGasto,
        maiorCategoria: maiorCat?.name ?? "-",
        mesMaiorGasto: maiorMes?.x ?? "-",
        mediaMensal,
        porTipo,
        porMesAno,
        tabelaOrdenada,
      };
    }, [gastos]);

  const tabelaFiltrada = useMemo(() => {
    if (!busca.trim()) return tabelaOrdenada;
    const q = busca.trim().toLowerCase();
    return tabelaOrdenada.filter(
      (g) =>
        (g.nomeFornecedor || "").toLowerCase().includes(q) ||
        (g.tipoDespesa || "").toLowerCase().includes(q)
    );
  }, [tabelaOrdenada, busca]);

  const tabelaExibida = tabelaFiltrada.slice(0, 50);

  if (gastos.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center dark:border-gray-800 dark:bg-white/[0.03]">
        <p className="text-gray-600 dark:text-gray-400">
          Nenhum dado de CEAP encontrado. Verifique se o arquivo{" "}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">
            ceap_gastos_2023_2026.json
          </code>{" "}
          existe em{" "}
          <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">data/federal/perfil/</code>.
        </p>
      </div>
    );
  }

  const inputClasses =
    "h-10 w-full rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-gray-500";

  const areaChartOptions: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "area",
      toolbar: { show: false },
      zoom: { enabled: false },
    },
    colors: ["#465FFF"],
    stroke: { curve: "smooth", width: 2 },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
    dataLabels: { enabled: false },
    grid: {
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    xaxis: {
      type: "category",
      categories: porMesAno.map((p) => p.x),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (v) => (v >= 1000 ? `R$ ${(v / 1000).toFixed(0)}k` : String(v)),
        style: { colors: "#6B7280", fontSize: "12px" },
      },
      min: 0,
    },
    tooltip: {
      y: { formatter: (v) => formatReais(v) },
    },
  };

  const areaSeries = [{ name: "Gasto (R$)", data: porMesAno.map((p) => p.y) }];

  const donutOptions: ApexOptions = {
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      toolbar: { show: false },
    },
    colors: ["#465FFF", "#12b76a", "#f79009", "#6366f1", "#ec4899", "#06b6d4"],
    labels: porTipo.map((p) => p.name),
    legend: { position: "bottom", fontSize: "12px" },
    dataLabels: { enabled: true, formatter: (val) => `${Number(val).toFixed(1)}%` },
    plotOptions: {
      pie: {
        donut: { size: "60%" },
      },
    },
    tooltip: {
      y: { formatter: (val) => formatReais(val) },
    },
  };

  const donutSeries = porTipo.map((p) => p.value);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-800 dark:text-white/90">
            {formatReais(total)}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Gasto Total do Mandato</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-100 text-success-600 dark:bg-success-900/30 dark:text-success-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          </div>
          <p className="mt-3 text-lg font-bold text-gray-800 dark:text-white/90 line-clamp-1" title={maiorCategoria}>
            {maiorCategoria}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Maior Categoria</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-warning-100 text-warning-600 dark:bg-warning-900/30 dark:text-warning-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="mt-3 text-xl font-bold text-gray-800 dark:text-white/90">{mesMaiorGasto}</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Mês com Maior Gasto</p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-light-100 text-blue-light-600 dark:bg-blue-light-900/30 dark:text-blue-light-400">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="mt-3 text-2xl font-bold text-gray-800 dark:text-white/90">
            {formatReais(mediaMensal)}
          </p>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Média de Gasto Mensal</p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ComponentCard
            title="Evolução dos Gastos"
            desc="Gastos CEAP por mês/ano"
          >
            <div className="min-h-[320px]">
              <ReactApexChart
                options={areaChartOptions}
                series={areaSeries}
                type="area"
                height={320}
              />
            </div>
          </ComponentCard>
        </div>
        <div>
          <ComponentCard
            title="Por Tipo de Despesa"
            desc="Distribuição percentual"
          >
            <div className="min-h-[320px]">
              <ReactApexChart
                options={donutOptions}
                series={donutSeries}
                type="donut"
                height={320}
              />
            </div>
          </ComponentCard>
        </div>
      </div>

      {/* Tabela */}
      <ComponentCard
        title="Detalhamento de Notas Fiscais"
        desc="Últimos 50 registros · Use a busca para filtrar"
      >
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Buscar por fornecedor ou tipo de despesa..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className={inputClasses}
          />
          <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-800">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                    Data (Mês/Ano)
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                    Tipo de Despesa
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                    Fornecedor
                  </th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">
                    Valor (R$)
                  </th>
                </tr>
              </thead>
              <tbody>
                {tabelaExibida.map((g, idx) => {
                  const v = valor(g);
                  const dataStr = g.dataDocumento
                    ? new Date(g.dataDocumento).toLocaleDateString("pt-BR", {
                        month: "2-digit",
                        year: "numeric",
                      })
                    : `${String(g.mes).padStart(2, "0")}/${g.ano}`;
                  return (
                    <tr
                      key={`${g.ano}-${g.mes}-${idx}`}
                      className={`border-b border-gray-100 transition hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/30 ${
                        idx % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-gray-50/50 dark:bg-gray-800/20"
                      }`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 text-gray-600 dark:text-gray-400">
                        {dataStr}
                      </td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-gray-700 dark:text-gray-300" title={g.tipoDespesa}>
                        {g.tipoDespesa}
                      </td>
                      <td className="max-w-[200px] truncate px-4 py-3 text-gray-700 dark:text-gray-300" title={g.nomeFornecedor}>
                        {g.nomeFornecedor}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-800 dark:text-white/90">
                        {formatReaisCell(v)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {tabelaFiltrada.length > 50 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Exibindo 50 de {tabelaFiltrada.length} registros. Use a busca para refinar.
            </p>
          )}
        </div>
      </ComponentCard>
    </div>
  );
}
