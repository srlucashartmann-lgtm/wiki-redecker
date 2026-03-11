import fs from "fs";
import path from "path";

/**
 * Registro bruto de despesa CEAP conforme retornado pela API da Câmara.
 */
export interface CeapGasto {
  ano: number;
  mes: number;
  tipoDespesa: string;
  valorDocumento?: number;
  valorLiquido?: number;
  nomeFornecedor: string;
  dataDocumento?: string;
  urlDocumento?: string;
}

const CEAP_PATH = path.join(
  process.cwd(),
  "data",
  "federal",
  "perfil",
  "ceap_gastos_2023_2026.json"
);

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

function normalizeRecord(raw: RawRecord): CeapGasto {
  const valor = getNum(raw, "valorLiquido", "valorDocumento", "valor");
  const mes = getNum(raw, "mes") || 0;
  let ano = getNum(raw, "ano") || 0;
  if (!ano && raw.dataDocumento) {
    const match = String(raw.dataDocumento).match(/(\d{4})/);
    if (match) ano = parseInt(match[1], 10);
  }
  return {
    ano,
    mes,
    tipoDespesa: getStr(raw, "tipoDespesa", "tipo_despesa"),
    valorDocumento: valor,
    valorLiquido: valor,
    nomeFornecedor: getStr(raw, "nomeFornecedor", "nome_fornecedor"),
    dataDocumento: getStr(raw, "dataDocumento", "data_documento"),
    urlDocumento: getStr(raw, "urlDocumento", "url_documento"),
  };
}

/**
 * Lê o arquivo CEAP e retorna array normalizado de gastos.
 * Retorna [] em caso de erro.
 */
export function loadCeapGastos(): CeapGasto[] {
  try {
    if (!fs.existsSync(CEAP_PATH)) return [];
    const raw = fs.readFileSync(CEAP_PATH, "utf-8");
    const parsed = JSON.parse(raw) as { dados?: RawRecord[] } | RawRecord[];
    const arr = Array.isArray(parsed) ? parsed : parsed?.dados ?? [];
    return arr
    .map((r) => normalizeRecord(r as RawRecord))
    .filter((g) => (g.valorLiquido ?? g.valorDocumento ?? 0) > 0);
  } catch {
    return [];
  }
}
