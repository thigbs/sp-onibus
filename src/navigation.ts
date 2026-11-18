import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { Linha } from './api';

/** Telas da pilha principal e os dados que cada uma recebe */
export type RootStackParamList = {
  Abas: undefined;
  Linha: { linha: Linha };
  Parada: { cp: number; np: string; ed?: string };
};

export type TelaProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;
