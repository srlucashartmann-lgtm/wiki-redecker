import fs from "fs";
import path from "path";

export interface Emenda {
  municipio: string;
  ano: number;
  valor_empenhado: number;
  valor_pago: number;
  area: string;
  status: "Pago" | "Parcial" | "Pendente";
  /** Subfunção orçamentária (subfuncao) */
  subfuncao?: string;
  /** Ação orçamentária (acao_orcamentaria) */
  acao_orcamentaria?: string;
  /** Plano orçamentário (plano_orcamentario) */
  plano_orcamentario?: string;
}

export interface EmendasKPIs {
  totalEmpenhado: number;
  totalPago: number;
  municipiosAtendidos: number;
}

export interface EmendaChartPoint {
  ano: string;
  empenhado: number;
  pago: number;
}

type RawRecord = Record<string, unknown>;

function getNum(obj: RawRecord, ...keys: string[]): number {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string") {
      const n = parseFloat(v.replace(/[^\d,.-]/g, "").replace(",", "."));
      if (!Number.isNaN(n)) return n;
    }
  }
  return 0;
}

function getStr(obj: RawRecord, ...keys: string[]): string {
  for (const k of keys) {
    const v = obj[k];
    if (typeof v === "string" && v.trim()) return String(v).trim();
  }
  return "";
}

function deriveStatus(empenhado: number, pago: number): "Pago" | "Parcial" | "Pendente" {
  if (pago <= 0) return "Pendente";
  if (Math.abs(pago - empenhado) < 0.01) return "Pago";
  return "Parcial";
}

function extractMunicipio(raw: string): string {
  const s = String(raw || "").trim();
  return s.replace(/\s*-\s*RS\s*$/i, "").trim() || s;
}

/**
 * Normaliza um registro bruto do JSON para o formato Emenda.
 * Tenta múltiplas chaves para compatibilidade com variações do schema.
 */
function normalizeRecord(raw: RawRecord): Emenda {
  const municipio = extractMunicipio(
    getStr(raw, "cidade_beneficiada", "municipio", "nome_municipio", "cidade")
  );
  const area = getStr(raw, "area_funcao", "area", "tema", "area_tema", "subfuncao");
  const valorEmpenhado = getNum(raw, "valor_empenhado", "valorEmpenhado");
  const valorPago = getNum(raw, "valor_pago", "valorPago");
  const anoRaw = getNum(raw, "ano") || (raw.ano as number);
  const ano = typeof anoRaw === "number" ? anoRaw : parseInt(String(anoRaw), 10) || 0;

  const subfuncao = getStr(raw, "subfuncao");
  const acaoOrcamentaria = getStr(raw, "acao_orcamentaria");
  const planoOrcamentario = getStr(raw, "plano_orcamentario");

  return {
    municipio: municipio || "Não informado",
    ano,
    valor_empenhado: valorEmpenhado,
    valor_pago: valorPago,
    area: area || "Outros",
    status: deriveStatus(valorEmpenhado, valorPago),
    subfuncao: subfuncao || undefined,
    acao_orcamentaria: acaoOrcamentaria || undefined,
    plano_orcamentario: planoOrcamentario || undefined,
  };
}

/**
 * Lê o arquivo JSON de emendas, normaliza os dados e retorna a lista.
 */
export function getEmendas(): Emenda[] {
  const filePath = path.join(process.cwd(), "data", "federal", "emendas", "emendas_lucas.json");
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, "utf-8");
    const raw = JSON.parse(content);
    const arr = Array.isArray(raw) ? raw : [raw];
    return arr.map((r: RawRecord) => normalizeRecord(r));
  } catch {
    return [];
  }
}

/**
 * Calcula KPIs a partir da lista de emendas.
 */
export function computeKPIs(emendas: Emenda[]): EmendasKPIs {
  const totalEmpenhado = emendas.reduce((s, e) => s + e.valor_empenhado, 0);
  const totalPago = emendas.reduce((s, e) => s + e.valor_pago, 0);
  const municipiosAtendidos = new Set(emendas.map((e) => e.municipio)).size;
  return { totalEmpenhado, totalPago, municipiosAtendidos };
}

/**
 * Agrega emendas por ano para o gráfico.
 */
export function aggregateChartData(emendas: Emenda[]): EmendaChartPoint[] {
  const byYear = new Map<number, { empenhado: number; pago: number }>();
  for (const e of emendas) {
    const curr = byYear.get(e.ano) ?? { empenhado: 0, pago: 0 };
    curr.empenhado += e.valor_empenhado;
    curr.pago += e.valor_pago;
    byYear.set(e.ano, curr);
  }
  return Array.from(byYear.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([ano, v]) => ({ ano: String(ano), empenhado: v.empenhado, pago: v.pago }));
}
