import fs from "node:fs";
import path from "node:path";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

function parseNumero(val: unknown): number {
  if (typeof val === "number" && !Number.isNaN(val)) return val;
  if (typeof val === "string") {
    const limpo = val.replace(/R\$\s?/gi, "").replace(/\./g, "").replace(",", ".");
    const n = parseFloat(limpo);
    return Number.isNaN(n) ? 0 : n;
  }
  return 0;
}

function ordenarPorChave(arr: Record<string, unknown>[], chave: string): Record<string, unknown>[] {
  return [...arr].sort((a, b) => parseNumero(b[chave]) - parseNumero(a[chave]));
}

function walkDir(dirPath: string, basePath: string): string[] {
  const files: string[] = [];
  try {
    if (!fs.existsSync(dirPath)) return [];
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dirPath, e.name);
      const rel = path.relative(basePath, full).replace(/\\/g, "/");
      if (e.isDirectory()) files.push(...walkDir(full, basePath));
      else if (e.isFile() && (rel.endsWith(".json") || rel.endsWith(".md") || rel.endsWith(".txt"))) {
        files.push(rel);
      }
    }
  } catch {
    // ignora pastas inacessíveis
  }
  return files.sort();
}

type TipoArquivo = "votos" | "emendas" | "proposicoes" | "outros" | "texto";

function detectarTipo(relPath: string, ext: string): TipoArquivo {
  const lower = relPath.toLowerCase();
  if (ext === ".md" || ext === ".txt") return "texto";
  if (lower.includes("voto")) return "votos";
  if (lower.includes("emenda")) return "emendas";
  if (lower.includes("proposic")) return "proposicoes";
  return "outros";
}

function processarVotos(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : parsed?.dados ?? [];
    if (arr.length === 0) return JSON.stringify(parsed);
    const chaveValor = "votos";
    const chaveLabel = "municipio";
    if (!(chaveValor in (arr[0] as Record<string, unknown>))) return JSON.stringify(parsed);
    const ordenado = ordenarPorChave(arr, chaveValor);

    const total = ordenado.reduce((acc, item) => acc + parseNumero(item[chaveValor]), 0);
    const top5 = ordenado.slice(0, 5).map((item, i) => `${i + 1}. ${item[chaveLabel]} (${parseNumero(item[chaveValor]).toLocaleString("pt-BR")})`);
    const bottom5 = ordenado.slice(-5).map((item, i) => `${i + 1}. ${item[chaveLabel]} (${parseNumero(item[chaveValor]).toLocaleString("pt-BR")})`);

    const resumo = [
      "--- RESUMO ESTATÍSTICO DE VOTOS ---",
      `Total de Votos na Base: ${total.toLocaleString("pt-BR")}`,
      `Top 5 Maiores Votações: ${top5.join(", ")}`,
      `Top 5 Menores Votações: ${bottom5.join(", ")}`,
    ].join("\n");

    const listaCompleta = JSON.stringify(ordenado, null, 2);
    return `${resumo}\n\n--- LISTA COMPLETA ---\n${listaCompleta}`;
  } catch {
    return raw;
  }
}

const CATEGORIAS_GENERICAS = ["múltiplo", "multiplo", "nacional", "rio grande do sul (uf)", "rio grande do sul"];

function processarEmendas(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    const arr = Array.isArray(parsed) ? parsed : parsed?.dados ?? [];
    if (arr.length === 0) return JSON.stringify(parsed);
    const primeiro = arr[0] as Record<string, unknown>;
    const chaveValor = ["valor_empenhado", "valor_pago", "valor", "recurso"].find((k) => k in primeiro);
    const chaveCidade = "cidade_beneficiada";
    if (!chaveValor) return JSON.stringify(parsed);

    const totaisPorCidade = arr.reduce((acc: Record<string, number>, item: Record<string, unknown>) => {
      const cidade = String(item[chaveCidade] ?? "").trim();
      const norm = cidade.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
      if (CATEGORIAS_GENERICAS.some((g) => norm.includes(g))) return acc;
      if (!cidade) return acc;
      acc[cidade] = (acc[cidade] ?? 0) + parseNumero(item[chaveValor]);
      return acc;
    }, {});

    const rankingCidades = Object.entries(totaisPorCidade)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 10);

    const fmt = (n: number) => `R$ ${n.toLocaleString("pt-BR")}`;
    const linhasTop10 = rankingCidades.map(([cidade, val], i) => `${i + 1}. ${cidade} - ${fmt(val as number)}`);

    const resumo = [
      "--- RESUMO DE EMENDAS POR CIDADE ---",
      "Top 10 Cidades que mais receberam (soma total):",
      linhasTop10.join("\n"),
      "(Nota: Valores genéricos como MÚLTIPLO e Nacional não estão neste Top 10 de cidades.)",
    ].join("\n");

    const listaCompleta = JSON.stringify(arr, null, 2);
    return `${resumo}\n\n--- LISTA COMPLETA DE EMENDAS ---\n${listaCompleta}`;
  } catch {
    return raw;
  }
}

function processarProposicoesOuOutros(raw: string): string {
  try {
    const parsed = JSON.parse(raw);
    return JSON.stringify(parsed);
  } catch {
    return raw;
  }
}

function processarArquivo(basePath: string, relPath: string, tipo: TipoArquivo): string {
  const fullPath = path.join(basePath, relPath);
  try {
    if (!fs.existsSync(fullPath) || !fs.statSync(fullPath).isFile()) return "";

    const raw = fs.readFileSync(fullPath, "utf-8");
    let conteudo = "";

    if (tipo === "texto") {
      conteudo = raw;
    } else if (tipo === "votos") {
      conteudo = processarVotos(raw);
    } else if (tipo === "emendas") {
      conteudo = processarEmendas(raw);
    } else {
      conteudo = processarProposicoesOuOutros(raw);
    }

    const titulos: Record<TipoArquivo, string> = {
      votos: "DADOS DE VOTOS",
      emendas: "DADOS DE EMENDAS",
      proposicoes: "DADOS DE PROPOSIÇÕES",
      outros: "DADOS",
      texto: "TEXTO",
    };
    const titulo = titulos[tipo];
    return `\n\n--- ${titulo} (${relPath}) ---\n\n${conteudo}`;
  } catch (err) {
    console.warn(`Erro ao ler ${relPath}:`, err);
    return "";
  }
}

function carregarContextoBase(): string {
  const basePath = path.join(process.cwd(), "data");

  if (!fs.existsSync(basePath) || !fs.statSync(basePath).isDirectory()) {
    return "Pasta data/ não encontrada.";
  }

  const arquivos = walkDir(basePath, basePath);
  const partes: string[] = [];

  for (const rel of arquivos) {
    const ext = path.extname(rel).toLowerCase();
    const tipo = detectarTipo(rel, ext);
    const conteudo = processarArquivo(basePath, rel, tipo);
    if (conteudo) {
      partes.push(conteudo);
    }
  }

  return partes.length > 0 ? partes.join("").trim() : "Nenhum arquivo pôde ser lido da pasta data/.";
}

const SYSTEM_INSTRUCTION = `Você é o 'Cérebro da Wiki Redecker', o analista de inteligência da War Room.
Sua única e exclusiva fonte de informação são os dados fornecidos no contexto abaixo.

REGRAS INEGOCIÁVEIS:
1. PROIBIDO DADOS EXTERNOS: Se a pergunta do usuário não puder ser respondida DIRETAMENTE com os dados do contexto, você deve responder EXATAMENTE: 'Desculpe, mas não encontrei registros sobre isso na base de dados oficial do mandato.'
2. É terminantemente PROIBIDO utilizar seu conhecimento prévio sobre política, notícias da internet ou biografia que não esteja no contexto.
3. Jamais invente ou estime valores financeiros ou de votos.
4. Sempre cite a fonte de forma executiva (ex: 'Conforme o arquivo de emendas...').
5. PRECISÃO ANALÍTICA: Quando questionado sobre rankings, maior valor, menor valor ou totais, você OBRIGATORIAMENTE deve analisar todos os itens do contexto antes de responder. Não pare no primeiro número alto que encontrar. A base de dados pode conter números formatados com pontos (ex: 17.538 significa dezessete mil quinhentos e trinta e oito).`;

type ChatMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const rawMessages = body.messages ?? (body.message ? [{ role: "user", content: body.message }] : []);
    const messages: ChatMessage[] = Array.isArray(rawMessages)
      ? rawMessages.filter((m: unknown) => m && typeof m === "object" && "role" in m && "content" in m)
      : [];

    const lastMessage = messages.length
      ? (messages[messages.length - 1] as ChatMessage).content
      : "Olá!";
    const history = messages.slice(0, -1);

    const contextoBase = carregarContextoBase();
    console.log("Tamanho do contexto lido:", contextoBase.length);

    const systemInstruction = `${SYSTEM_INSTRUCTION}

--- CONTEÚDO DA BASE DE DADOS (use como única fonte) ---
${contextoBase}`;

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction,
    });

    const historyForGemini = history.map((msg: ChatMessage) => ({
      role: msg.role === "user" ? "user" as const : "model" as const,
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({ history: historyForGemini });
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return new Response(text, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error: unknown) {
    console.error(error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
