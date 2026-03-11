import fs from "fs";
import path from "path";

export interface AnoVotos {
  ano: string;
  votos: number;
}

interface MunicipioVotos {
  municipio: string;
  votos: number;
}

const ANO_REGEX = /votos_.*_(\d{4})\.json$/i;

function getJsonFilesRecursive(dirPath: string): string[] {
  const files: string[] = [];
  try {
    if (!fs.existsSync(dirPath)) return [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        files.push(...getJsonFilesRecursive(fullPath));
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        files.push(fullPath);
      }
    }
  } catch {
    return [];
  }
  return files;
}

function extractYearFromFilename(filePath: string): string | null {
  const filename = path.basename(filePath);
  const match = filename.match(ANO_REGEX);
  return match ? match[1] : null;
}

function parseAndSumVotos(filePath: string): number {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content) as MunicipioVotos[];
    if (!Array.isArray(data)) return 0;
    return data.reduce((acc, item) => {
      const votos = typeof item.votos === "number" ? item.votos : 0;
      return acc + votos;
    }, 0);
  } catch {
    return 0;
  }
}

/**
 * Lê os arquivos de votos em data/estadual e data/federal/eleicao,
 * consolida a totalização por ano e retorna array ordenado.
 */
export function getEvolucaoVotos(): AnoVotos[] {
  const cwd = process.cwd();
  const dirs = [
    path.join(cwd, "data", "estadual"),
    path.join(cwd, "data", "federal", "eleicao"),
  ];

  const anoMap = new Map<string, number>();

  for (const dir of dirs) {
    const files = getJsonFilesRecursive(dir);
    for (const filePath of files) {
      const ano = extractYearFromFilename(filePath);
      if (!ano) continue;
      const votos = parseAndSumVotos(filePath);
      const current = anoMap.get(ano) ?? 0;
      anoMap.set(ano, current + votos);
    }
  }

  const result: AnoVotos[] = Array.from(anoMap.entries()).map(([ano, votos]) => ({
    ano,
    votos,
  }));

  return result.sort((a, b) => a.ano.localeCompare(b.ano));
}

export interface MunicipioComVariacao {
  municipio: string;
  votos_2010: number;
  votos_2014: number;
  votos_2018: number;
  votos_2022: number;
  variacao: number;
  tendencia: "alta" | "baixa";
}

function parseMunicipioVotos(filePath: string): MunicipioVotos[] {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(content) as MunicipioVotos[];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

/**
 * Agrupa votos por município em todos os anos e calcula variação 2018→2022.
 */
export function getMunicipiosComVariacao(): MunicipioComVariacao[] {
  const cwd = process.cwd();
  const dirs = [
    path.join(cwd, "data", "estadual"),
    path.join(cwd, "data", "federal", "eleicao"),
  ];

  const municipioPorAno = new Map<string, Record<string, number>>();

  for (const dir of dirs) {
    const files = getJsonFilesRecursive(dir);
    for (const filePath of files) {
      const ano = extractYearFromFilename(filePath);
      if (!ano) continue;
      const items = parseMunicipioVotos(filePath);
      const current = municipioPorAno.get(ano) ?? {};
      const map: Record<string, number> = { ...current };
      for (const item of items) {
        const m = String(item.municipio || "").trim();
        if (m) map[m] = (map[m] ?? 0) + (typeof item.votos === "number" ? item.votos : 0);
      }
      municipioPorAno.set(ano, map);
    }
  }

  const allMunicipios = new Set<string>();
  for (const byYear of municipioPorAno.values()) {
    for (const m of Object.keys(byYear)) allMunicipios.add(m);
  }

  const result: MunicipioComVariacao[] = [];

  for (const municipio of allMunicipios) {
    const v2010 = municipioPorAno.get("2010")?.[municipio] ?? 0;
    const v2014 = municipioPorAno.get("2014")?.[municipio] ?? 0;
    const v2018 = municipioPorAno.get("2018")?.[municipio] ?? 0;
    const v2022 = municipioPorAno.get("2022")?.[municipio] ?? 0;

    let variacao = 0;
    if (v2018 > 0) variacao = ((v2022 - v2018) / v2018) * 100;

    result.push({
      municipio,
      votos_2010: v2010,
      votos_2014: v2014,
      votos_2018: v2018,
      votos_2022: v2022,
      variacao,
      tendencia: variacao >= 0 ? "alta" : "baixa",
    });
  }

  return result.sort((a, b) => a.municipio.localeCompare(b.municipio));
}
