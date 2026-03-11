/**
 * NLP básico para geração de nuvem de palavras a partir dos discursos.
 * Formato de saída compatível com react-tagcloud: [{ value, count }, ...]
 */

import type { Discurso } from "./discursos";

const STOP_WORDS = new Set([
  "o", "a", "os", "as", "um", "uma", "uns", "umas",
  "de", "do", "da", "dos", "das", "em", "no", "na", "nos", "nas",
  "para", "por", "com", "sem", "sob", "entre", "durante", "até",
  "que", "quem", "qual", "quais", "cujo", "cuja", "cujos", "cujas",
  "se", "como", "mais", "mas", "ou", "e", "é", "são", "foi", "ser",
  "ao", "aos", "à", "às", "pelo", "pela", "pelos", "pelas",
  "este", "esta", "estes", "estas", "esse", "essa", "esses", "essas",
  "aquele", "aquela", "aqueles", "aquelas", "isto", "isso", "aquilo",
  "ele", "ela", "eles", "elas", "eu", "nós", "tu", "vós",
  "me", "te", "se", "lhe", "nos", "vos", "lhes",
  "meu", "minha", "teu", "tua", "seu", "sua", "nosso", "vosso", "deles", "delas",
  "aquele", "aquela", "outro", "outra", "algum", "alguma", "todo", "toda",
  "muito", "pouco", "certo", "vários", "várias", "qualquer", "tal",
  "não", "sim", "já", "ainda", "sempre", "nunca", "também", "apenas",
  "aqui", "ali", "aí", "lá", "onde", "quando", "porque", "pois",
  "assim", "então", "depois", "antes", "entre", "sobre", "sob",
  "sr", "sra", "exmo", "exma", "deputado", "deputada", "presidente",
  "plenário", "tribuna", "casa", "mesa", "sessão", "sessões",
  "desta", "deste", "nestes", "nestas", "nesses", "nessas",
  "votação", "votar", "aprovado", "rejeitado", "requerimento",
  "projeto", "lei", "emenda", "parecer", "relator",
  "disse", "digo", "quero", "quer", "queremos",
]);

const MIN_WORD_LENGTH = 3;

export interface PalavraNuvem {
  value: string;
  count: number;
}

export function gerarNuvemDePalavras(
  discursosFiltrados: Discurso[],
  maxPalavras = 50
): PalavraNuvem[] {
  if (discursosFiltrados.length === 0) return [];

  const texto = discursosFiltrados
    .map((d) => `${d.resumo_evento} ${d.conteudo_completo}`)
    .join(" ")
    .toLowerCase()
    .replace(/[^\wáéíóúãõâêôàç\s]/g, " ")
    .replace(/\s+/g, " ");

  const palavras = texto.split(" ").filter((w) => {
    const limpa = w.trim().toLowerCase();
    return (
      limpa.length >= MIN_WORD_LENGTH &&
      !STOP_WORDS.has(limpa) &&
      !/^\d+$/.test(limpa)
    );
  });

  const freq: Record<string, number> = {};
  for (const p of palavras) {
    freq[p] = (freq[p] ?? 0) + 1;
  }

  return Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .slice(0, Math.min(maxPalavras, 50))
    .map(([value, count]) => ({ value, count }));
}
