"use client";

import React, { useState } from "react";
import type { AnoVotos, MunicipioComVariacao } from "@/lib/data";
import VotosDashboardGeral from "./VotosDashboardGeral";
import MunicipiosTable from "./MunicipiosTable";

interface VotosTabsProps {
  evolucaoGeral: AnoVotos[];
  municipios: MunicipioComVariacao[];
}

export default function VotosTabs({ evolucaoGeral, municipios }: VotosTabsProps) {
  const [activeTab, setActiveTab] = useState<"geral" | "municipios">("geral");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50/50 p-1">
        <button
          onClick={() => setActiveTab("geral")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            activeTab === "geral"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setActiveTab("municipios")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition ${
            activeTab === "municipios"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-600 hover:text-slate-800"
          }`}
        >
          Por Município
        </button>
      </div>

      {activeTab === "geral" && (
        <VotosDashboardGeral evolucaoGeral={evolucaoGeral} municipios={municipios} />
      )}

      {activeTab === "municipios" && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <MunicipiosTable data={municipios} />
        </div>
      )}
    </div>
  );
}
