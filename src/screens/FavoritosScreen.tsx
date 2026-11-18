import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { Linha } from '../api';
import { AvisoModoExemplo, CartaoLinha, Estrela, estilos } from '../components/ui';
import type { RootStackParamList } from '../navigation';
import {
  alternarLinhaFavorita,
  alternarParadaFavorita,
  listarLinhasFavoritas,
  listarParadasFavoritas,
  type ParadaFavorita,
} from '../storage/storage';
import { cores, espaco } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function FavoritosScreen() {
  const navigation = useNavigation<Nav>();
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [paradas, setParadas] = useState<ParadaFavorita[]>([]);

  // Recarrega do AsyncStorage sempre que a aba aparece
  useFocusEffect(
    useCallback(() => {
      listarLinhasFavoritas().then(setLinhas);
      listarParadasFavoritas().then(setParadas);
    }, []),
  );

  const nada = linhas.length === 0 && paradas.length === 0;

  return (
    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
      <AvisoModoExemplo />
      <ScrollView contentContainerStyle={{ padding: espaco.g, paddingTop: 0 }}>
        {nada && (
          <View style={s.vazio}>
            <Text style={{ fontSize: 40 }}>☆</Text>
            <Text style={[estilos.sub, { textAlign: 'center' }]}>
              Você ainda não tem favoritos. Toque na estrela de uma linha ou de uma parada
              para salvar aqui.
            </Text>
          </View>
        )}

        {linhas.length > 0 && <Text style={estilos.titulo}>Linhas</Text>}
        <View style={{ gap: espaco.p }}>
          {linhas.map((l) => (
            <CartaoLinha
              key={l.cl}
              linha={l}
              onPress={() => navigation.navigate('Linha', { linha: l })}
              direita={
                <Estrela
                  ativa
                  onPress={async () => {
                    await alternarLinhaFavorita(l);
                    setLinhas(await listarLinhasFavoritas());
                  }}
                />
              }
            />
          ))}
        </View>

        {paradas.length > 0 && <Text style={estilos.titulo}>Paradas</Text>}
        <View style={{ gap: espaco.p }}>
          {paradas.map((p) => (
            <Pressable
              key={p.cp}
              onPress={() => navigation.navigate('Parada', p)}
              style={({ pressed }) => [estilos.cartao, pressed && { opacity: 0.7 }]}
            >
              <Text style={{ fontSize: 22 }}>🚏</Text>
              <View style={{ flex: 1 }}>
                <Text style={estilos.destino} numberOfLines={1}>
                  {p.np}
                </Text>
                {!!p.ed && <Text style={estilos.sub}>{p.ed}</Text>}
              </View>
              <Estrela
                ativa
                onPress={async () => {
                  await alternarParadaFavorita(p);
                  setParadas(await listarParadasFavoritas());
                }}
              />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  vazio: { alignItems: 'center', gap: espaco.m, padding: espaco.gg, marginTop: espaco.gg },
});
