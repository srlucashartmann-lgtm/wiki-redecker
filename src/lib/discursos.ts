/**
 * Parser de arquivos Markdown de discursos.
 * Extrai Data, Evento e conteúdo completo de cada arquivo.
 */

export interface Discurso {
  id: string;
  data_bruta: string;
  data_formatada: string;
  resumo_evento: string;
  conteudo_completo: string;
}

const MESES: Record<number, string> = {
  1: "Jan",
  2: "Fev",
  3: "Mar",
  4: "Abr",
  5: "Mai",
  6: "Jun",
  7: "Jul",
  8: "Ago",
  9: "Set",
  10: "Out",
  11: "Nov",
  12: "Dez",
};

function formatarDataBR(dataStr: string): string {
  const match = dataStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return dataStr;
  const [, ano, mes, dia] = match;
  const mesNum = parseInt(mes, 10);
  const mesNome = MESES[mesNum] ?? mes;
  return `${dia} ${mesNome} ${ano}`;
}

export function parseDiscurso(content: string, filename: string): Discurso | null {
  const dataMatch = content.match(/\*\*Data:\*\*\s*([^\n]+)/);
  const eventoMatch = content.match(/\*\*Evento:\*\*\s*(.+)/);
  const separatorIndex = content.indexOf("---");

  if (!dataMatch || !eventoMatch) return null;

  const data_bruta = dataMatch[1].trim();
  const resumo_evento = eventoMatch[1].trim();
  const conteudo_completo =
    separatorIndex >= 0
      ? content.slice(separatorIndex + 3).trim()
      : "";

  return {
    id: filename.replace(/\.md$/, ""),
    data_bruta,
    data_formatada: formatarDataBR(data_bruta),
    resumo_evento,
    conteudo_completo,
  };
}

export interface DiscursosKPIs {
  total: number;
  ultimo_data: string | null;
  ultimo_resumo: string | null;
}

export function computeDiscursosKPIs(discursos: Discurso[]): DiscursosKPIs {
  const total = discursos.length;
  const ultimo = discursos[0] ?? null;
  return {
    total,
    ultimo_data: ultimo?.data_formatada ?? null,
    ultimo_resumo: ultimo?.resumo_evento ?? null,
  };
}
