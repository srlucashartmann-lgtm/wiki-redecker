import EmendasClient from "./EmendasClient";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { getEmendas, computeKPIs, aggregateChartData } from "@/lib/emendas";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Rastreador de Emendas | Wiki Redecker",
  description: "Acompanhamento de destinação de recursos e pagamentos",
};

export default function EmendasPage() {
  const emendas = getEmendas();
  const kpis = computeKPIs(emendas);
  const chartData = aggregateChartData(emendas);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Rastreador de Emendas" />
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Rastreador de Emendas</h1>
        <p className="mt-1 text-sm text-slate-500">
          Acompanhamento de destinação de recursos e pagamentos
        </p>
      </div>
      <EmendasClient kpis={kpis} chartData={chartData} emendas={emendas} />
    </div>
  );
}
