import fs from "fs";
import path from "path";
import type {
  BiografiaDeputado,
  Profissao,
  Ocupacao,
  HistoricoMandato,
  MandatoExterno,
  ProfileData,
} from "./perfil-types";

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
 * Carrega todos os dados do perfil a partir dos JSONs.
 * Usar apenas em Server Components (usa fs).
 */
export function loadProfileData(): ProfileData {
  const bioRaw = loadJson<BiografiaDeputado | { dados?: unknown }>("biografia_deputado.json", {});
  const biografia =
    "nomeCivil" in bioRaw || "dataNascimento" in bioRaw ? (bioRaw as BiografiaDeputado) : {};

  const profRaw = loadJson<{ dados?: Profissao[] }>("profissoes.json", {});
  const profissoes = Array.isArray(profRaw?.dados) ? profRaw.dados : [];

  const occRaw = loadJson<{ dados?: Ocupacao[] }>("ocupacoes.json", {});
  const ocupacoes = Array.isArray(occRaw?.dados) ? occRaw.dados : [];

  const histRaw = loadJson<{ dados?: HistoricoMandato[] }>("historico_mandatos.json", {});
  const historicoMandatos = Array.isArray(histRaw?.dados) ? histRaw.dados : [];

  const extRaw = loadJson<{ dados?: MandatoExterno[] }>("mandatos_externos.json", {});
  const mandatosExternos = Array.isArray(extRaw?.dados) ? extRaw.dados : [];

  return {
    biografia,
    profissoes,
    ocupacoes,
    historicoMandatos,
    mandatosExternos,
  };
}
