import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { api, minutosAte, type Linha, type LinhaPrevisao } from '../api';
import { AvisoModoExemplo, Estado, Estrela, estilos } from '../components/ui';
import type { TelaProps } from '../navigation';
import { alternarParadaFavorita, listarParadasFavoritas } from '../storage/storage';
import { cores, espaco } from '../theme';

const ATUALIZAR_A_CADA_MS = 20000;

/** Monta um objeto Linha a partir da linha que vem na previsão */
function linhaDaPrevisao(l: LinhaPrevisao): Linha {
  const [lt, tl] = l.c.split('-');
  return {
    cl: l.cl,
    lc: false,
    lt,
    tl: Number(tl) || 0,
    sl: l.sl,
    // lt0 = destino, lt1 = origem; ajustamos para o sentido bater
    tp: l.sl === 1 ? l.lt1 : l.lt0,
    ts: l.sl === 1 ? l.lt0 : l.lt1,
  };
}

function textoMinutos(min: number) {
  if (min <= 0) return 'chegando';
  return `${min} min`;
}

export default function ParadaScreen({ route, navigation }: TelaProps<'Parada'>) {
  const { cp, np, ed } = route.params;
  const [linhas, setLinhas] = useState<LinhaPrevisao[]>([]);
  const [hora, setHora] = useState('');
  const [favorita, setFavorita] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: np,
      headerRight: () => (
        <Estrela
          ativa={favorita}
          onPress={async () => setFavorita(await alternarParadaFavorita({ cp, np, ed }))}
        />
      ),
    });
  }, [navigation, cp, np, ed, favorita]);

  useEffect(() => {
    listarParadasFavoritas().then((l) => setFavorita(l.some((p) => p.cp === cp)));
  }, [cp]);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const prev = await api.previsaoDaParada(cp);
      const ordenadas = [...(prev.p?.l ?? [])].sort(
        (a, b) => minutosAte(a.vs[0]?.t ?? '23:59') - minutosAte(b.vs[0]?.t ?? '23:59'),
      );
      setLinhas(ordenadas);
      setHora(prev.hr);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao buscar a previsão.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, [cp]);

  useEffect(() => {
    carregar();
    const timer = setInterval(carregar, ATUALIZAR_A_CADA_MS);
    return () => clearInterval(timer);
  }, [carregar]);

  return (
    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
      <AvisoModoExemplo />
      <FlatList
        data={linhas}
        keyExtractor={(l) => `${l.cl}`}
        contentContainerStyle={{ padding: espaco.g, gap: espaco.p }}
        refreshControl={
          <RefreshControl
            refreshing={atualizando}
            onRefresh={() => {
              setAtualizando(true);
              carregar();
            }}
          />
        }
        ListHeaderComponent={
          <View style={{ marginBottom: espaco.p }}>
            {!!ed && <Text style={estilos.sub}>{ed}</Text>}
            <Text style={estilos.sub}>
              Previsão de chegada{hora ? ` · atualizada às ${hora}` : ''}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <Estado
            carregando={carregando}
            erro={erro}
            onTentarDeNovo={carregar}
            vazio
            mensagemVazio="Nenhum ônibus previsto para esta parada agora."
          />
        }
        renderItem={({ item }) => {
          const proximos = item.vs.slice(0, 3).map((v) => minutosAte(v.t));
          return (
            <Pressable
              onPress={() => navigation.navigate('Linha', { linha: linhaDaPrevisao(item) })}
              style={({ pressed }) => [estilos.cartao, pressed && { opacity: 0.7 }]}
            >
              <View style={estilos.letreiro}>
                <Text style={estilos.letreiroTexto}>{item.c}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={estilos.destino} numberOfLines={1}>
                  → {item.lt0}
                </Text>
                <Text style={estilos.sub}>
                  {proximos.length > 1
                    ? `Depois: ${proximos.slice(1).map(textoMinutos).join(', ')}`
                    : 'Sem outro ônibus previsto'}
                </Text>
              </View>
              <View style={s.tempo}>
                <Text style={s.tempoNumero}>{textoMinutos(proximos[0] ?? 0)}</Text>
                {item.vs[0]?.a && <Text style={estilos.sub}>♿</Text>}
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  tempo: { alignItems: 'flex-end', minWidth: 70 },
  tempoNumero: { fontSize: 18, fontWeight: '700', color: cores.sucesso },
});
