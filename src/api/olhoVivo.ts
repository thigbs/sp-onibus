import type {
  Linha,
  OnibusService,
  Parada,
  PosicaoLinha,
  PrevisaoParada,
} from './types';

// Documentação: https://www.sptrans.com.br/desenvolvedores/
// Desde 2024 a API só aceita HTTPS.
const BASE_URL = 'https://api.olhovivo.sptrans.com.br/v2.1';

/**
 * Cliente da API Olho Vivo.
 *
 * Como funciona a autenticação:
 * 1. Fazemos um POST em /Login/Autenticar?token=SEU_TOKEN.
 * 2. A API responde `true` e devolve um cookie de sessão.
 * 3. O celular guarda esse cookie sozinho e o envia nas próximas chamadas.
 * Se a sessão expirar (erro 401), fazemos o login de novo e repetimos a chamada.
 */
export function criarClienteOlhoVivo(token: string): OnibusService {
  let autenticado = false;

  async function autenticar(): Promise<void> {
    const resp = await fetch(
      `${BASE_URL}/Login/Autenticar?token=${encodeURIComponent(token)}`,
      { method: 'POST', credentials: 'include' },
    );
    const ok = await resp.json().catch(() => false);
    if (!resp.ok || ok !== true) {
      throw new Error(
        'Não foi possível autenticar na SPTrans. Confira se o token está correto e se o aplicativo já foi aprovado.',
      );
    }
    autenticado = true;
  }

  async function get<T>(caminho: string, tentarDeNovo = true): Promise<T> {
    if (!autenticado) await autenticar();

    const resp = await fetch(`${BASE_URL}${caminho}`, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    });

    if (resp.status === 401 && tentarDeNovo) {
      autenticado = false;
      return get<T>(caminho, false);
    }
    if (!resp.ok) {
      throw new Error(`Erro ${resp.status} ao consultar a SPTrans.`);
    }
    return (await resp.json()) as T;
  }

  return {
    modo: 'api',

    buscarLinhas: (termo) =>
      get<Linha[]>(`/Linha/Buscar?termosBusca=${encodeURIComponent(termo)}`),

    buscarParadasDaLinha: (codigoLinha) =>
      get<Parada[]>(`/Parada/BuscarParadasPorLinha?codigoLinha=${codigoLinha}`),

    posicaoDaLinha: async (codigoLinha) => {
      const dados = await get<PosicaoLinha | null>(
        `/Posicao/Linha?codigoLinha=${codigoLinha}`,
      );
      return dados ?? { hr: '', vs: [] };
    },

    previsaoDaParada: async (codigoParada) => {
      const dados = await get<PrevisaoParada | null>(
        `/Previsao/Parada?codigoParada=${codigoParada}`,
      );
      return dados ?? { hr: '', p: null };
    },
  };
}
