/**
 * Tipos e constantes do Perfil.
 * Arquivo sem dependências Node (fs/path) para uso em Client Components.
 */

export interface BiografiaDeputado {
  nomeCivil?: string;
  nome?: string;
  dataNascimento?: string;
  municipioNascimento?: string;
  ufNascimento?: string;
  escolaridade?: string;
  resumo?: string;
  ultimoStatus?: {
    nome?: string;
    siglaPartido?: string;
    siglaUf?: string;
  };
}

export interface Profissao {
  titulo?: string;
}

export interface Ocupacao {
  titulo?: string;
  entidade?: string;
  anoInicio?: number;
  anoFim?: number;
}

export interface HistoricoMandato {
  idLegislatura?: number;
  dataHora?: string;
  siglaPartido?: string;
  siglaUf?: string;
  situacao?: string;
}

export interface MandatoExterno {
  cargo?: string;
  siglaUf?: string;
  anoInicio?: string | number;
  anoFim?: string | number;
  siglaPartidoEleicao?: string;
}

export interface ProfileData {
  biografia: BiografiaDeputado;
  profissoes: Profissao[];
  ocupacoes: Ocupacao[];
  historicoMandatos: HistoricoMandato[];
  mandatosExternos: MandatoExterno[];
}

/** Legislatura Câmara → período aproximado */
export const LEGISLATURA_ANOS: Record<number, { inicio: number; fim: number }> = {
  55: { inicio: 2015, fim: 2019 },
  56: { inicio: 2019, fim: 2023 },
  57: { inicio: 2023, fim: 2027 },
};
