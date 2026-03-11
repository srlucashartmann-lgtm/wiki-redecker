import fs from "fs";
import path from "path";
import type { Comissao, FrenteParlamentar, Evento, ArticulacaoData } from "./articulacao-types";

const PERFIL_DIR = path.join(process.cwd(), "data", "federal", "perfil");

function loadJson<T>(filename: string, fallback: T): T {
  try {
    const filePath = path.join(PERFIL_DIR, filename);
    if (!fs.existsSync(filePath)) return fallback;
    const raw = fs.readFileSync(filePath, "utf-8");
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

/**
 * Carrega dados de articulação (comissões, frentes, eventos).
 * Usar apenas em Server Components (usa fs).
 */
export function loadArticulacaoData(): ArticulacaoData {
  const comRaw = loadJson<{ dados?: Comissao[] }>("comissoes.json", {});
  const comissoes = Array.isArray(comRaw?.dados) ? comRaw.dados : [];

  const frentRaw = loadJson<{ dados?: FrenteParlamentar[] }>("frentes_parlamentares.json", {});
  const frentes = Array.isArray(frentRaw?.dados) ? frentRaw.dados : [];

  const evtRaw = loadJson<{ dados?: Evento[] }>("eventos.json", {});
  const eventos = Array.isArray(evtRaw?.dados) ? evtRaw.dados : [];

  return { comissoes, frentes, eventos };
}
