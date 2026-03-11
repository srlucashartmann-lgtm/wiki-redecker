import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import CeapDashboard from "./CeapDashboard";
import { loadCeapGastos } from "@/lib/ceap";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Transparência CEAP | Wiki Redecker",
  description: "Cota para Exercício da Atividade Parlamentar · Prestação de contas",
};

export default function TransparenciaPage() {
  const gastos = loadCeapGastos();

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Transparência CEAP" />
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white/90">
          Transparência de Gastos (CEAP)
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
          Cota para Exercício da Atividade Parlamentar · Prestação de contas
        </p>
      </div>
      <CeapDashboard gastos={gastos} />
    </div>
  );
}
