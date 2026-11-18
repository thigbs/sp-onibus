import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

import { api, destino, letreiro, type Parada, type Veiculo } from '../api';
import { AvisoModoExemplo, Estado, Estrela, estilos } from '../components/ui';
import type { TelaProps } from '../navigation';
import { alternarLinhaFavorita, listarLinhasFavoritas } from '../storage/storage';
import { cores, espaco } from '../theme';

const ATUALIZAR_A_CADA_MS = 15000;

// Centro de São Paulo, usado antes de carregar as paradas
const REGIAO_INICIAL = {
  latitude: -23.5505,
  longitude: -46.6333,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

export default function LinhaScreen({ route, navigation }: TelaProps<'Linha'>) {
  const { linha } = route.params;
  const mapa = useRef<MapView>(null);
  const [paradas, setParadas] = useState<Parada[]>([]);
  const [onibus, setOnibus] = useState<Veiculo[]>([]);
  const [hora, setHora] = useState('');
  const [favorita, setFavorita] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  // Estrela de favorito no cabeçalho
  useLayoutEffect(() => {
    navigation.setOptions({
      title: letreiro(linha),
      headerRight: () => (
        <Estrela
          ativa={favorita}
          onPress={async () => setFavorita(await alternarLinhaFavorita(linha))}
        />
      ),
    });
  }, [navigation, linha, favorita]);

  useEffect(() => {
    listarLinhasFavoritas().then((l) => setFavorita(l.some((x) => x.cl === linha.cl)));
  }, [linha.cl]);

  const atualizarOnibus = useCallback(async () => {
    try {
      const pos = await api.posicaoDaLinha(linha.cl);
      setOnibus(pos.vs);
      setHora(pos.hr);
    } catch {
      // mantém as últimas posições se uma atualização falhar
    }
  }, [linha.cl]);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [ps] = await Promise.all([api.buscarParadasDaLinha(linha.cl), atualizarOnibus()]);
      setParadas(ps);
      if (ps.length > 0) {
        // espera o mapa desenhar e enquadra todas as paradas
        setTimeout(() => {
          mapa.current?.fitToCoordinates(
            ps.map((p) => ({ latitude: p.py, longitude: p.px })),
            { edgePadding: { top: 40, right: 40, bottom: 40, left: 40 }, animated: true },
          );
        }, 300);
      }
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar a linha.');
    } finally {
      setCarregando(false);
    }
  }, [linha.cl, atualizarOnibus]);

  useEffect(() => {
    carregar();
    const timer = setInterval(atualizarOnibus, ATUALIZAR_A_CADA_MS);
    return () => clearInterval(timer);
  }, [carregar, atualizarOnibus]);

  return (
    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
      <AvisoModoExemplo />
      <MapView ref={mapa} style={s.mapa} initialRegion={REGIAO_INICIAL}>
        {paradas.length > 1 && (
          <Polyline
            coordinates={paradas.map((p) => ({ latitude: p.py, longitude: p.px }))}
            strokeColor={cores.parada}
            strokeWidth={3}
          />
        )}
        {paradas.map((p) => (
          <Marker
            key={`p${p.cp}`}
            coordinate={{ latitude: p.py, longitude: p.px }}
            title={p.np}
            description={p.ed}
            pinColor={cores.parada}
            onCalloutPress={() =>
              navigation.navigate('Parada', { cp: p.cp, np: p.np, ed: p.ed })
            }
          />
        ))}
        {onibus.map((v) => (
          <Marker
            key={`v${v.p}`}
            coordinate={{ latitude: v.py, longitude: v.px }}
            title={`Ônibus ${v.p}`}
            description={v.a ? 'Acessível ♿' : undefined}
          >
            <View style={s.onibus}>
              <Text style={{ fontSize: 16 }}>🚌</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={s.resumo}>
        <Text style={estilos.destino}>→ {destino(linha)}</Text>
        <Text style={estilos.sub}>
          {onibus.length} ônibus em circulação
          {hora ? ` · atualizado às ${hora}` : ''}
        </Text>
      </View>

      <FlatList
        data={paradas}
        keyExtractor={(p) => String(p.cp)}
        contentContainerStyle={{ paddingHorizontal: espaco.g, paddingBottom: espaco.gg }}
        ListHeaderComponent={
          paradas.length > 0 ? (
            <Text style={estilos.titulo}>Paradas (toque para ver a previsão)</Text>
          ) : undefined
        }
        ListEmptyComponent={
          <Estado
            carregando={carregando}
            erro={erro}
            onTentarDeNovo={carregar}
            vazio
            mensagemVazio="Nenhuma parada encontrada para esta linha."
          />
        }
        renderItem={({ item, index }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('Parada', { cp: item.cp, np: item.np, ed: item.ed })
            }
            style={({ pressed }) => [s.parada, pressed && { opacity: 0.6 }]}
          >
            <View style={s.bolinha}>
              <Text style={s.bolinhaTexto}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '600', color: cores.texto }}>{item.np}</Text>
              {!!item.ed && <Text style={estilos.sub}>{item.ed}</Text>}
            </View>
            <Text style={{ color: cores.textoSuave }}>›</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  mapa: { height: 280 },
  resumo: {
    backgroundColor: cores.cartao,
    padding: espaco.g,
    borderBottomWidth: 1,
    borderColor: cores.borda,
  },
  onibus: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 3,
    borderWidth: 2,
    borderColor: cores.primaria,
  },
  parada: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.m,
    paddingVertical: espaco.m,
    borderBottomWidth: 1,
    borderColor: cores.borda,
  },
  bolinha: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: cores.parada,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bolinhaTexto: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
