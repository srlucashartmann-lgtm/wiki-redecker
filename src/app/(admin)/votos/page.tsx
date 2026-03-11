import { getEvolucaoVotos, getMunicipiosComVariacao } from "@/lib/data";
import type { AnoVotos, MunicipioComVariacao } from "@/lib/data";
import VotosTabs from "@/components/votos/VotosTabs";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Evolução de Votos | Wiki Redecker",
  description: "Evolução histórica da totalização de votos do deputado por ano",
};

export default async function VotosPage() {
  let evolucaoGeral: AnoVotos[] = [];
  let municipios: MunicipioComVariacao[] = [];

  try {
    evolucaoGeral = getEvolucaoVotos();
    municipios = getMunicipiosComVariacao();
  } catch {
    evolucaoGeral = [];
    municipios = [];
  }

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Evolução de Votos" />

      <h1 className="text-2xl font-bold text-slate-800">
        Evolução de Votos
      </h1>

      <VotosTabs evolucaoGeral={evolucaoGeral} municipios={municipios} />
    </div>
  );
}
