import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Linha } from '../api/types';

/**
 * Persistência local com AsyncStorage.
 * Tudo é salvo no próprio celular como texto JSON, em três "gavetas":
 * - linhas favoritas
 * - paradas favoritas
 * - histórico das últimas buscas
 */

const CHAVES = {
  linhasFavoritas: '@sp-onibus/linhas-favoritas',
  paradasFavoritas: '@sp-onibus/paradas-favoritas',
  historico: '@sp-onibus/historico-buscas',
};

const MAX_HISTORICO = 10;

export interface ParadaFavorita {
  cp: number;
  np: string;
  ed?: string;
}

async function ler<T>(chave: string, padrao: T): Promise<T> {
  try {
    const texto = await AsyncStorage.getItem(chave);
    return texto ? (JSON.parse(texto) as T) : padrao;
  } catch {
    return padrao;
  }
}

async function salvar<T>(chave: string, valor: T): Promise<void> {
  await AsyncStorage.setItem(chave, JSON.stringify(valor));
}

// ---------- Linhas favoritas ----------

export const listarLinhasFavoritas = () => ler<Linha[]>(CHAVES.linhasFavoritas, []);

export async function alternarLinhaFavorita(linha: Linha): Promise<boolean> {
  const lista = await listarLinhasFavoritas();
  const existe = lista.some((l) => l.cl === linha.cl);
  const nova = existe ? lista.filter((l) => l.cl !== linha.cl) : [linha, ...lista];
  await salvar(CHAVES.linhasFavoritas, nova);
  return !existe; // true = agora é favorita
}

// ---------- Paradas favoritas ----------

export const listarParadasFavoritas = () =>
  ler<ParadaFavorita[]>(CHAVES.paradasFavoritas, []);

export async function alternarParadaFavorita(parada: ParadaFavorita): Promise<boolean> {
  const lista = await listarParadasFavoritas();
  const existe = lista.some((p) => p.cp === parada.cp);
  const nova = existe ? lista.filter((p) => p.cp !== parada.cp) : [parada, ...lista];
  await salvar(CHAVES.paradasFavoritas, nova);
  return !existe;
}

// ---------- Histórico de buscas ----------

export const listarHistorico = () => ler<string[]>(CHAVES.historico, []);

export async function adicionarAoHistorico(termo: string): Promise<string[]> {
  const t = termo.trim();
  if (!t) return listarHistorico();
  const lista = await listarHistorico();
  const nova = [t, ...lista.filter((x) => x.toLowerCase() !== t.toLowerCase())].slice(
    0,
    MAX_HISTORICO,
  );
  await salvar(CHAVES.historico, nova);
  return nova;
}

export async function limparHistorico(): Promise<void> {
  await AsyncStorage.removeItem(CHAVES.historico);
}
