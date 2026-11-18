import type {
  Linha,
  LinhaPrevisao,
  OnibusService,
  Parada,
  VeiculoPrevisao,
} from './types';
import { letreiro } from './types';

/**
 * DADOS DE EXEMPLO
 * Usados enquanto o grupo não tem o token da SPTrans.
 * As linhas e paradas são fictícias (só inspiradas em lugares reais de SP)
 * e os ônibus "andam" sozinhos conforme o relógio, para o mapa e a previsão
 * parecerem reais. Quando o token for configurado, nada disto é usado.
 */

const PARADAS: Record<number, Parada> = {
  1: { cp: 1, np: 'Praça da Sé', ed: 'Praça da Sé, Centro', py: -23.5503, px: -46.6339 },
  2: { cp: 2, np: 'República', ed: 'Av. Ipiranga, 200', py: -23.5443, px: -46.6425 },
  3: { cp: 3, np: 'Consolação', ed: 'R. da Consolação, 1500', py: -23.5536, px: -46.6560 },
  4: { cp: 4, np: 'Clínicas', ed: 'Av. Dr. Arnaldo, 100', py: -23.5560, px: -46.6680 },
  5: { cp: 5, np: 'Largo de Pinheiros', ed: 'R. Butantã, 50', py: -23.5670, px: -46.6930 },
  6: { cp: 6, np: 'Paraíso', ed: 'Av. Paulista, 50', py: -23.5733, px: -46.6418 },
  7: { cp: 7, np: 'Brigadeiro', ed: 'Av. Paulista, 700', py: -23.5705, px: -46.6450 },
  8: { cp: 8, np: 'Trianon-MASP', ed: 'Av. Paulista, 1500', py: -23.5615, px: -46.6560 },
  9: { cp: 9, np: 'Sumaré', ed: 'Av. Dr. Arnaldo, 1500', py: -23.5505, px: -46.6780 },
  10: { cp: 10, np: 'Liberdade', ed: 'Praça da Liberdade', py: -23.5555, px: -46.6355 },
  11: { cp: 11, np: 'Vila Mariana', ed: 'R. Domingos de Morais, 900', py: -23.5890, px: -46.6340 },
};

interface LinhaExemplo {
  base: Omit<Linha, 'cl' | 'sl'>;
  cl1: number; // código no sentido 1
  cl2: number; // código no sentido 2
  paradas: number[]; // ordem das paradas no sentido 1
  onibus: number; // quantos ônibus por sentido
}

const LINHAS: LinhaExemplo[] = [
  {
    base: { lc: false, lt: '7001', tl: 10, tp: 'Praça da Sé', ts: 'Largo de Pinheiros' },
    cl1: 1001, cl2: 34769,
    paradas: [1, 2, 3, 4, 5],
    onibus: 3,
  },
  {
    base: { lc: false, lt: '7002', tl: 10, tp: 'Paraíso', ts: 'Sumaré' },
    cl1: 1002, cl2: 34770,
    paradas: [6, 7, 8, 3, 4, 9],
    onibus: 3,
  },
  {
    base: { lc: false, lt: '7003', tl: 21, tp: 'Vila Mariana', ts: 'República' },
    cl1: 1003, cl2: 34771,
    paradas: [11, 6, 10, 1, 2],
    onibus: 2,
  },
  {
    base: { lc: false, lt: '7004', tl: 10, tp: 'Paraíso', ts: 'Liberdade' },
    cl1: 1004, cl2: 34772,
    paradas: [6, 7, 8, 3, 2, 1, 10],
    onibus: 2,
  },
];

const MINUTOS_POR_TRECHO = 4; // tempo que o ônibus leva entre duas paradas

function linhaPorCodigo(cl: number) {
  for (const l of LINHAS) {
    if (l.cl1 === cl) return { l, sl: 1, paradas: l.paradas };
    if (l.cl2 === cl) return { l, sl: 2, paradas: [...l.paradas].reverse() };
  }
  return null;
}

function paraLinha(l: LinhaExemplo, sl: 1 | 2): Linha {
  return { ...l.base, cl: sl === 1 ? l.cl1 : l.cl2, sl };
}

/** Progresso de cada ônibus na rota, em "trechos" (ex.: 1.5 = metade do 2º trecho) */
function progressoDosOnibus(cl: number, totalTrechos: number, quantidade: number) {
  const minutosAgora = Date.now() / 60000;
  const voltaCompleta = totalTrechos * MINUTOS_POR_TRECHO;
  return Array.from({ length: quantidade }, (_, i) => {
    const deslocamento = (voltaCompleta / quantidade) * i + (cl % 7);
    const minutoNaVolta = (minutosAgora + deslocamento) % voltaCompleta;
    return minutoNaVolta / MINUTOS_POR_TRECHO;
  });
}

function pontoNaRota(paradas: number[], progresso: number) {
  const i = Math.min(Math.floor(progresso), paradas.length - 2);
  const f = progresso - i;
  const a = PARADAS[paradas[i]];
  const b = PARADAS[paradas[i + 1]];
  return { py: a.py + (b.py - a.py) * f, px: a.px + (b.px - a.px) * f };
}

function horaAgora() {
  return new Date().toTimeString().slice(0, 5);
}

function prefixo(cl: number, i: number) {
  return 10000 + ((cl * 37 + i * 211) % 89999);
}

function esperar<T>(valor: T): Promise<T> {
  // simula o tempo de resposta da internet
  return new Promise((resolve) => setTimeout(() => resolve(valor), 350));
}

const normalizar = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export const servicoExemplo: OnibusService = {
  modo: 'exemplo',

  async buscarLinhas(termo) {
    const t = normalizar(termo.trim());
    const resultado: Linha[] = [];
    for (const l of LINHAS) {
      const texto = normalizar(`${letreiro(l.base)} ${l.base.tp} ${l.base.ts}`);
      if (t && texto.includes(t)) {
        resultado.push(paraLinha(l, 1), paraLinha(l, 2));
      }
    }
    return esperar(resultado);
  },

  async buscarParadasDaLinha(cl) {
    const info = linhaPorCodigo(cl);
    return esperar(info ? info.paradas.map((cp) => PARADAS[cp]) : []);
  },

  async posicaoDaLinha(cl) {
    const info = linhaPorCodigo(cl);
    if (!info) return esperar({ hr: horaAgora(), vs: [] });
    const trechos = info.paradas.length - 1;
    const vs = progressoDosOnibus(cl, trechos, info.l.onibus).map((prog, i) => ({
      p: prefixo(cl, i),
      a: i % 2 === 0,
      ta: new Date().toISOString(),
      ...pontoNaRota(info.paradas, prog),
    }));
    return esperar({ hr: horaAgora(), vs });
  },

  async previsaoDaParada(cp) {
    const parada = PARADAS[cp];
    if (!parada) return esperar({ hr: horaAgora(), p: null });

    const linhas: LinhaPrevisao[] = [];
    for (const l of LINHAS) {
      for (const sl of [1, 2] as const) {
        const cl = sl === 1 ? l.cl1 : l.cl2;
        const paradas = sl === 1 ? l.paradas : [...l.paradas].reverse();
        const idx = paradas.indexOf(cp);
        if (idx < 0 || idx === 0) continue; // não passa aqui ou é o ponto inicial

        const trechos = paradas.length - 1;
        const vs: VeiculoPrevisao[] = [];
        progressoDosOnibus(cl, trechos, l.onibus).forEach((prog, i) => {
          if (prog >= idx) return; // esse ônibus já passou pela parada
          const minutos = (idx - prog) * MINUTOS_POR_TRECHO;
          const chegada = new Date(Date.now() + minutos * 60000);
          vs.push({
            p: prefixo(cl, i),
            a: i % 2 === 0,
            ta: new Date().toISOString(),
            t: chegada.toTimeString().slice(0, 5),
            ...pontoNaRota(paradas, prog),
          });
        });
        if (vs.length === 0) continue;
        vs.sort((x, y) => x.t.localeCompare(y.t));
        const linha = paraLinha(l, sl);
        linhas.push({
          c: letreiro(linha),
          cl,
          sl,
          lt0: sl === 1 ? l.base.ts : l.base.tp,
          lt1: sl === 1 ? l.base.tp : l.base.ts,
          qv: vs.length,
          vs,
        });
      }
    }
    return esperar({
      hr: horaAgora(),
      p: { cp: parada.cp, np: parada.np, py: parada.py, px: parada.px, l: linhas },
    });
  },
};
