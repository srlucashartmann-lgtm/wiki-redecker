import ElectoralMap, { DadosUnificados } from "@/components/ElectoralMap";
import { Metadata } from "next";
import fs from "fs";
import path from "path";
import React from "react";

export const metadata: Metadata = {
  title: "Raio-X Eleitoral | Wiki Redecker",
  description: "Visão geral da cidade",
};

/** Mesma lógica do ElectoralMap para cruzar IBGE com JSON de votos */
function normalizeCityName(name: string): string {
  if (!name || typeof name !== "string") return "";

  // 1. Limpeza agressiva
  let cleanName = name
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/['`´]/g, "")
    .replace(/- RS/g, "")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // 2. Override Marreta (casos críticos IBGE vs TSE)
  if (cleanName.includes("LIVRAMENTO")) {
    return "SANTANA DO LIVRAMENTO";
  }
  if (cleanName === "SAO VALERIO DO SUL") {
    return "SAO VALERIO DO SUL";
  }

  return cleanName;
}

function loadVotosUnificados(): DadosUnificados {
  const base = path.join(process.cwd(), "data", "federal", "eleicao");
  const raw2018 = fs.readFileSync(
    path.join(base, "votos_lucas_2018.json"),
    "utf-8"
  );
  const raw2022 = fs.readFileSync(
    path.join(base, "votos_lucas_2022.json"),
    "utf-8"
  );
  const arr2018 = JSON.parse(raw2018) as { municipio: string; votos: number }[];
  const arr2022 = JSON.parse(raw2022) as { municipio: string; votos: number }[];

  const dict: DadosUnificados = {};

  for (const { municipio, votos } of arr2018) {
    const key = normalizeCityName(municipio);
    dict[key] = { votos2018: votos, votos2022: 0 };
  }
  for (const { municipio, votos } of arr2022) {
    const key = normalizeCityName(municipio);
    if (dict[key]) {
      dict[key].votos2022 = votos;
    } else {
      dict[key] = { votos2018: 0, votos2022: votos };
    }
  }
  return dict;
}

export default function DashboardPage() {
  const dadosUnificados = loadVotosUnificados();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-800">Raio-X Eleitoral</h1>
      <p className="text-slate-600 -mt-2">
        Visão geral da cidade e distribuição de votos por município (2018 vs
        2022).
      </p>
      <ElectoralMap dadosUnificados={dadosUnificados} />
    </div>
  );
}
