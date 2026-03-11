import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import ProposicoesClient from "./ProposicoesClient";
import {
  computeProposicoesKPIs,
  mergeProposicoes,
  aggregateProposicoesByTipo,
  agregarFocoDeAtuacao,
  selecionarVitrineImpacto,
  type ProposicaoRaw,
} from "@/lib/proposicoes";
import { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";

export const metadata: Metadata = {
  title: "Proposições | Wiki Redecker",
  description: "Eficiência legislativa e desempenho parlamentar",
};

const AUTORIA_PATH = path.join(process.cwd(), "data", "federal", "proposicoes", "proposicoes_autoria_928.json");
const DETALHADAS_PATH = path.join(process.cwd(), "data", "federal", "proposicoes", "proposicoes_detalhadas.json");

function loadJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed?.dados ?? parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export default function ProposicoesPage() {
  const autoria = loadJson<ProposicaoRaw[]>(AUTORIA_PATH, []);
  const detalhadas = loadJson<ProposicaoRaw[]>(DETALHADAS_PATH, []);

  const proposicoes = mergeProposicoes(autoria, detalhadas);
  const kpis = computeProposicoesKPIs(proposicoes);
  const chartData = aggregateProposicoesByTipo(proposicoes);
  const focoDeAtuacao = agregarFocoDeAtuacao(proposicoes);
  const vitrineImpacto = selecionarVitrineImpacto(proposicoes);

  return (
    <div className="space-y-6">
      <PageBreadcrumb pageTitle="Proposições" />
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Proposições</h1>
        <p className="mt-1 text-sm text-slate-500">
          CRM Legislativo · Performance e eficiência
        </p>
      </div>
      <ProposicoesClient
        proposicoes={proposicoes}
        kpis={kpis}
        chartData={chartData}
        focoDeAtuacao={focoDeAtuacao}
        vitrineImpacto={vitrineImpacto}
      />
    </div>
  );
}
