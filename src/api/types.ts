// Tipos que espelham as respostas da API Olho Vivo (SPTrans) v2.1.
// Os nomes curtos (cl, lt, sl...) são os campos originais da API.

/** Linha retornada por Linha/Buscar */
export interface Linha {
  cl: number; // código interno da linha (usado nas outras consultas)
  lc: boolean; // linha circular?
  lt: string; // primeira parte do letreiro (ex.: "8000")
  tl: number; // segunda parte do letreiro (ex.: 10)
  sl: number; // sentido: 1 = principal -> secundário, 2 = secundário -> principal
  tp: string; // terminal principal
  ts: string; // terminal secundário
}

/** Parada retornada por Parada/BuscarParadasPorLinha */
export interface Parada {
  cp: number; // código da parada
  np: string; // nome da parada
  ed: string; // endereço
  py: number; // latitude
  px: number; // longitude
}

/** Veículo em Posicao/Linha */
export interface Veiculo {
  p: number; // prefixo do veículo
  a: boolean; // acessível para pessoas com deficiência
  ta: string; // horário da última atualização (ISO)
  py: number;
  px: number;
}

/** Resposta de Posicao/Linha */
export interface PosicaoLinha {
  hr: string; // horário de referência
  vs: Veiculo[];
}

/** Veículo com previsão de chegada */
export interface VeiculoPrevisao extends Veiculo {
  t: string; // horário previsto de chegada (HH:mm)
}

/** Linha dentro de Previsao/Parada */
export interface LinhaPrevisao {
  c: string; // letreiro completo (ex.: "8000-10")
  cl: number;
  sl: number;
  lt0: string; // letreiro de destino
  lt1: string; // letreiro de origem
  qv: number; // quantidade de veículos
  vs: VeiculoPrevisao[];
}

/** Resposta de Previsao/Parada */
export interface PrevisaoParada {
  hr: string;
  p: {
    cp: number;
    np: string;
    py: number;
    px: number;
    l: LinhaPrevisao[];
  } | null;
}

/** Contrato que tanto a API real quanto os dados de exemplo seguem */
export interface OnibusService {
  modo: 'api' | 'exemplo';
  buscarLinhas(termo: string): Promise<Linha[]>;
  buscarParadasDaLinha(codigoLinha: number): Promise<Parada[]>;
  posicaoDaLinha(codigoLinha: number): Promise<PosicaoLinha>;
  previsaoDaParada(codigoParada: number): Promise<PrevisaoParada>;
}

// ---------- Funções auxiliares de exibição ----------

/** "8000-10" */
export function letreiro(linha: Pick<Linha, 'lt' | 'tl'>): string {
  return `${linha.lt}-${linha.tl}`;
}

/** Para onde a linha vai, de acordo com o sentido */
export function destino(linha: Linha): string {
  return linha.sl === 1 ? linha.ts : linha.tp;
}

export function origem(linha: Linha): string {
  return linha.sl === 1 ? linha.tp : linha.ts;
}
