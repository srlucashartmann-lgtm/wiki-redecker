import fs from "node:fs";
import path from "node:path";

const DATA_DIR = "data";
const MAX_CONTEXT_CHARS = 100_000; // limite conservador para API Free (evita estourar tokens)
const TEXT_EXTENSIONS = new Set([".json", ".md", ".txt"]);

const KEYWORDS_VOTOS = ["voto", "votos", "cidade", "cidades", "eleição", "eleições", "eleitoral", "eleitor"];
const KEYWORDS_PROPOSICOES = ["projeto", "projetos", "lei", "leis", "proposição", "proposições", "PL", "PEC", "emenda"];

function isTextFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

function walkDir(dirPath: string): string[] {
  const files: string[] = [];
  try {
    if (!fs.existsSync(dirPath)) return [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        files.push(...walkDir(fullPath));
      } else if (entry.isFile() && isTextFile(entry.name)) {
        files.push(fullPath);
      }
    }
  } catch {
    // ignora pastas inacessíveis
  }
  return files.sort();
}

function hasKeyword(pergunta: string, keywords: string[]): boolean {
  const lower = pergunta.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  return keywords.some((k) => lower.includes(k.toLowerCase()));
}

function readFiles(
  cwd: string,
  relativePaths: string[],
  maxChars: number
): string {
  const parts: string[] = [];
  let totalLen = 0;

  for (const rel of relativePaths) {
    const fullPath = path.join(cwd, DATA_DIR, rel);
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) continue;
    if (totalLen >= maxChars) break;

    try {
      const raw = fs.readFileSync(fullPath, "utf-8");
      const remaining = maxChars - totalLen;
      const content = raw.length > remaining ? raw.slice(0, remaining) + "\n\n[... truncado ...]" : raw;
      parts.push(`\n\n--- ARQUIVO: data/${rel} ---\n\n${content}`);
      totalLen += content.length;
    } catch {
      parts.push(`\n\n--- ARQUIVO: data/${rel} --- (erro ao ler)\n\n`);
    }
  }

  return parts.join("").trimStart() || "(nenhum arquivo lido)";
}

function getVotosPaths(cwd: string): string[] {
  const paths: string[] = [];
  const dirs = [
    path.join(cwd, DATA_DIR, "federal", "votos"),
    path.join(cwd, DATA_DIR, "federal", "eleicao"),
    path.join(cwd, DATA_DIR, "estadual", "eleicoes"),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const files = fs.readdirSync(dir).filter((f) => isTextFile(f));
    for (const f of files) {
      paths.push(path.relative(path.join(cwd, DATA_DIR), path.join(dir, f)));
    }
  }
  return paths;
}

function getProposicoesPaths(cwd: string): string[] {
  const paths: string[] = [];
  const base = path.join(cwd, DATA_DIR);
  const dirs = [
    path.join(base, "federal", "proposicoes"),
    path.join(base, "estadual"),
  ];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const name = e.name.toLowerCase();
      if (e.isFile() && (name.includes("proposic") || name.includes("proposicoes"))) {
        paths.push(path.relative(base, path.join(dir, e.name)));
      }
    }
  }
  return paths;
}

function listAvailableFiles(cwd: string): string {
  const dataPath = path.join(cwd, DATA_DIR);
  if (!fs.existsSync(dataPath) || !fs.statSync(dataPath).isDirectory()) {
    return "Pasta data/ não encontrada.";
  }
  const files = walkDir(dataPath);
  const relative = files.map((f) => path.relative(cwd, f));
  return relative.join("\n");
}

/**
 * Retorna contexto filtrado pela pergunta do usuário para reduzir tamanho e TPM.
 * - voto, cidade, eleição → apenas JSONs de votos
 * - projeto, lei → apenas proposições
 * - sem palavra-chave → só lista de arquivos + instrução para solicitar contexto
 */
export function buildChatContext(userMessage: string): string {
  const cwd = process.cwd();
  const dataPath = path.join(cwd, DATA_DIR);

  if (!fs.existsSync(dataPath) || !fs.statSync(dataPath).isDirectory()) {
    return "BASE DE DADOS: Pasta data/ não encontrada.";
  }

  if (hasKeyword(userMessage, KEYWORDS_VOTOS)) {
    const paths = getVotosPaths(cwd);
    const content = readFiles(cwd, paths, MAX_CONTEXT_CHARS);
    return `DADOS DE VOTOS E ELEIÇÕES (arquivos carregados conforme sua pergunta):\n\n${content}`;
  }

  if (hasKeyword(userMessage, KEYWORDS_PROPOSICOES)) {
    const paths = getProposicoesPaths(cwd);
    const content = readFiles(cwd, paths, MAX_CONTEXT_CHARS);
    return `DADOS DE PROPOSIÇÕES E PROJETOS DE LEI (arquivos carregados conforme sua pergunta):\n\n${content}`;
  }

  const fileList = listAvailableFiles(cwd);
  return `Nenhum conjunto de dados específico foi carregado para esta pergunta. Segue a lista de arquivos disponíveis na pasta data/:

${fileList}

Se precisar de dados de votos/eleições, mencione "voto", "cidade" ou "eleição" na pergunta.
Se precisar de proposições/projetos de lei, mencione "projeto" ou "lei".
Peça ao usuário que reformule a pergunta incluindo essas palavras-chave, ou responda que não há contexto carregado para responder com precisão.`;
}
