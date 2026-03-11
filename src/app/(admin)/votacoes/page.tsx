import { readFile } from "fs/promises";
import path from "path";
import VotacoesDashboard from "./VotacoesDashboard";

export type VotacaoRaw = {
  ano: number;
  data_hora_sessao: string;
  proposicao_resumo: string;
  voto: string;
};

export default async function VotacoesPage() {
  let votacoesData: VotacaoRaw[] = [];

  try {
    const filePath = path.join(
      process.cwd(),
      "data",
      "federal",
      "votos",
      "votacoes_lucas.json"
    );
    const content = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);

    if (Array.isArray(parsed)) {
      votacoesData = parsed;
    } else if (parsed?.votacoes && Array.isArray(parsed.votacoes)) {
      votacoesData = parsed.votacoes;
    } else {
      votacoesData = [];
    }
  } catch (err) {
    console.error("[VotacoesPage] Erro ao ler votacoes_lucas.json:", err);
    votacoesData = [];
  }

  return <VotacoesDashboard votacoesData={votacoesData} />;
}
