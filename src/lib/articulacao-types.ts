/**
 * Tipos para Força de Articulação.
 * Arquivo sem dependências Node (fs) para uso em Client Components.
 */

export interface Comissao {
  idOrgao?: number;
  siglaOrgao?: string;
  nomeOrgao?: string;
  nomePublicacao?: string;
  titulo?: string;
  dataInicio?: string;
  dataFim?: string | null;
}

export interface FrenteParlamentar {
  id?: number;
  titulo?: string;
  idLegislatura?: number;
}

export interface Evento {
  id?: number;
  dataHoraInicio?: string;
  dataHoraFim?: string | null;
  descricao?: string;
  descricaoTipo?: string;
  localExterno?: string | null;
  localCamara?: { nome?: string } | null;
  situacao?: string;
}

export interface ArticulacaoData {
  comissoes: Comissao[];
  frentes: FrenteParlamentar[];
  eventos: Evento[];
}
