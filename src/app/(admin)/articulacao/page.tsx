import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ArticulacaoDashboard from "./ArticulacaoDashboard";
import { loadArticulacaoData } from "@/lib/articulacao";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Força de Articulação | Wiki Redecker",
  description: "Mapa de poder · Comissões, frentes parlamentares e agenda institucional",
};

export default function ArticulacaoPage() {
  const data = loadArticulacaoData();

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Força de Articulação" />
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white/90">
          Força de Articulação
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
          Mapa de poder · Assentos em comissões, frentes parlamentares e presença institucional
        </p>
      </div>
      <ArticulacaoDashboard data={data} />
    </div>
  );
}
