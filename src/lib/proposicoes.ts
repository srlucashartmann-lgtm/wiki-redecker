/**
 * Merge e KPIs de proposições legislativas.
 * Fontes: proposicoes_autoria_928.json + proposicoes_detalhadas.json
 */

export interface ProposicaoRaw {
  id: number;
  uri?: string;
  siglaTipo?: string;
  codTipo?: number;
  numero?: number;
  ano?: number;
  ementa?: string;
  dataApresentacao?: string;
  statusProposicao?: {
    descricaoSituacao?: string;
    url?: string;
    dataHora?: string;
    [k: string]: unknown;
  };
  urlInteiroTeor?: string;
  _temas?: { tema?: string; codTema?: number }[];
  [k: string]: unknown;
}

export interface Proposicao {
  id: number;
  siglaTipo: string;
  numero: number;
  ano: number;
  numeroAno: string;
  ementa: string;
  statusAtual: string;
  urlDocumento: string | null;
  tema: string | null;
}

export interface ProposicoesKPIs {
  totalApresentadas: number;
  projetosDeLei: number;
  taxaConversao: number;
  tramitando: number;
  arquivadas: number;
}

const SIGLAS_ALTO_IMPACTO = new Set(["PL", "PEC", "PLP"]);
const STATUS_ARQUIVADA = /arquivad/i;
const STATUS_APROVADO = /aprovad|transformado em norma/i;

function safeStr(v: unknown): string {
  if (v == null) return "";
  return String(v).trim();
}

function getStatus(item: ProposicaoRaw): string {
  const s = item.statusProposicao?.descricaoSituacao;
  return s ? String(s).trim() : "Status não informado";
}

function getUrl(item: ProposicaoRaw): string | null {
  const u = item.statusProposicao?.url ?? item.urlInteiroTeor;
  return u && typeof u === "string" && u.startsWith("http") ? u : null;
}

function getTema(item: ProposicaoRaw): string | null {
  const temas = item._temas;
  if (!Array.isArray(temas) || temas.length === 0) return null;
  const t = temas[0]?.tema;
  return t ? String(t).trim() : null;
}

export function mergeProposicoes(
  autoria: ProposicaoRaw[],
  detalhadas: ProposicaoRaw[]
): Proposicao[] {
  const byId = new Map<number, ProposicaoRaw>();
  for (const a of autoria) {
    if (a.id != null) byId.set(Number(a.id), { ...a });
  }
  for (const d of detalhadas) {
    if (d.id != null) {
      const existing = byId.get(Number(d.id));
      byId.set(Number(d.id), existing ? { ...existing, ...d } : { ...d });
    }
  }

  return Array.from(byId.values()).map((item) => ({
    id: item.id,
    siglaTipo: safeStr(item.siglaTipo) || "—",
    numero: typeof item.numero === "number" ? item.numero : 0,
    ano: typeof item.ano === "number" ? item.ano : 0,
    numeroAno: `${item.numero ?? "?"}/${item.ano ?? "?"}`,
    ementa: safeStr(item.ementa) || "Ementa não disponível.",
    statusAtual: getStatus(item),
    urlDocumento: getUrl(item),
    tema: getTema(item),
  }));
}

export function computeProposicoesKPIs(proposicoes: Proposicao[]): ProposicoesKPIs {
  const total = proposicoes.length;
  const pl = proposicoes.filter((p) => SIGLAS_ALTO_IMPACTO.has(p.siglaTipo));
  const arquivadas = proposicoes.filter((p) => STATUS_ARQUIVADA.test(p.statusAtual));
  const aprovadas = proposicoes.filter((p) => STATUS_APROVADO.test(p.statusAtual));
  const tramitando = total - arquivadas.length;

  const taxaConversao =
    total > 0 && aprovadas.length > 0
      ? Math.round((aprovadas.length / total) * 100)
      : tramitando > 0
        ? Math.round((tramitando / total) * 100)
        : 0;

  return {
    totalApresentadas: total,
    projetosDeLei: pl.length,
    taxaConversao,
    tramitando,
    arquivadas: arquivadas.length,
  };
}

export function aggregateProposicoesByTipo(proposicoes: Proposicao[]): { name: string; value: number }[] {
  const byTipo = new Map<string, number>();
  for (const p of proposicoes) {
    const t = p.siglaTipo || "Outros";
    byTipo.set(t, (byTipo.get(t) ?? 0) + 1);
  }
  return Array.from(byTipo.entries())
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));
}

/** Termômetro de tramitação: Quente | Morno | Frio */
export type TemperaturaStatus = "quente" | "morno" | "frio";

const STATUS_QUENTE = /aprovad|transformado em lei|transformado em norma|pronta para pauta|pronto para pauta/i;
const STATUS_FRIO = /arquivad|retirad|apensad|rejeitad|prejudicad|extinto/i;

export function classificarTemperatura(statusAtual: string): TemperaturaStatus {
  const s = statusAtual.trim();
  if (!s) return "morno";
  if (STATUS_QUENTE.test(s)) return "quente";
  if (STATUS_FRIO.test(s)) return "frio";
  return "morno";
}

/** Macro-temas baseados em palavras-chave na ementa */
const MACRO_TEMAS: { tema: string; palavras: string[] }[] = [
  { tema: "Agro", palavras: ["rural", "agricultura", "terra", "agrícola", "agro", "campo", "produtor rural", "lavoura"] },
  { tema: "Economia/Impostos", palavras: ["imposto", "tributo", "fiscal", "receita", "orçamento", "tribut"] },
  { tema: "Saúde", palavras: ["hospital", "remédio", "sus", "saúde", "medicamento", "tratamento", "enfermidade"] },
  { tema: "Educação", palavras: ["educação", "escola", "universidade", "ensino", "estudante", "professor"] },
  { tema: "Infraestrutura", palavras: ["rodovia", "energia", "transporte", "saneamento", "obras", "infraestrutura"] },
  { tema: "Administração Pública", palavras: ["servidor", "funcionário público", "união", "município", "estado", "administração pública"] },
  { tema: "Trabalho", palavras: ["trabalhador", "emprego", "jornada", "ctps", "fgts", "aposentadoria"] },
  { tema: "Meio Ambiente", palavras: ["ambiental", "meio ambiente", "floresta", "recursos naturais", "sustentabilidade"] },
];

export function extrairMacroTema(ementa: string, temaOficial: string | null): string {
  const texto = `${ementa} ${temaOficial ?? ""}`.toLowerCase();
  for (const { tema, palavras } of MACRO_TEMAS) {
    if (palavras.some((p) => texto.includes(p))) return tema;
  }
  return temaOficial?.trim() || "Outros";
}

export function agregarFocoDeAtuacao(proposicoes: Proposicao[]): { tema: string; count: number }[] {
  const pls = proposicoes.filter((p) => SIGLAS_ALTO_IMPACTO.has(p.siglaTipo));
  const byTema = new Map<string, number>();
  for (const p of pls) {
    const tema = extrairMacroTema(p.ementa, p.tema);
    byTema.set(tema, (byTema.get(tema) ?? 0) + 1);
  }
  return Array.from(byTema.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tema, count]) => ({ tema, count }));
}

export function selecionarVitrineImpacto(proposicoes: Proposicao[]): Proposicao[] {
  const comTemperatura = proposicoes.map((p) => ({
    p,
    temp: classificarTemperatura(p.statusAtual),
    altoImpacto: SIGLAS_ALTO_IMPACTO.has(p.siglaTipo),
  }));
  const score = (x: { temp: TemperaturaStatus; altoImpacto: boolean }) => {
    let s = 0;
    if (x.altoImpacto) s += 10;
    if (x.temp === "quente") s += 20;
    if (x.temp === "morno") s += 5;
    return s;
  };
  return comTemperatura
    .sort((a, b) => score(b) - score(a))
    .slice(0, 3)
    .map((x) => x.p);
}
