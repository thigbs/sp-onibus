import { servicoExemplo } from './exemplo';
import { criarClienteOlhoVivo } from './olhoVivo';
import type { OnibusService } from './types';

// O token fica no arquivo .env.local (que NÃO vai para o GitHub).
// Sem token, o app usa os dados de exemplo.
const TOKEN = process.env.EXPO_PUBLIC_SPTRANS_TOKEN?.trim() ?? '';

export const api: OnibusService = TOKEN ? criarClienteOlhoVivo(TOKEN) : servicoExemplo;

export * from './types';

/** Minutos que faltam até um horário "HH:mm" (a API devolve a previsão assim) */
export function minutosAte(horario: string): number {
  const [h, m] = horario.split(':').map(Number);
  const agora = new Date();
  const alvo = new Date(agora);
  alvo.setHours(h, m, 0, 0);
  let diff = Math.round((alvo.getTime() - agora.getTime()) / 60000);
  if (diff < -720) diff += 1440; // previsão passa da meia-noite
  return Math.max(0, diff);
}
