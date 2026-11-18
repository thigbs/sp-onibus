import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { api, destino, letreiro, origem, type Linha } from '../api';
import { cores, espaco } from '../theme';

/** Faixa que avisa quando o app está usando dados de exemplo */
export function AvisoModoExemplo() {
  if (api.modo !== 'exemplo') return null;
  return (
    <View style={estilos.aviso}>
      <Text style={estilos.avisoTexto}>
        Modo demonstração: dados de exemplo. Configure o token da SPTrans para ver os
        ônibus reais.
      </Text>
    </View>
  );
}

/** Cartão de uma linha de ônibus */
export function CartaoLinha({
  linha,
  onPress,
  direita,
}: {
  linha: Linha;
  onPress: () => void;
  direita?: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [estilos.cartao, pressed && { opacity: 0.7 }]}
      accessibilityRole="button"
      accessibilityLabel={`Linha ${letreiro(linha)} sentido ${destino(linha)}`}
    >
      <View style={estilos.letreiro}>
        <Text style={estilos.letreiroTexto}>{letreiro(linha)}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={estilos.destino} numberOfLines={1}>
          {linha.lc ? '↻ ' : '→ '}
          {destino(linha)}
        </Text>
        <Text style={estilos.sub} numberOfLines={1}>
          Saindo de {origem(linha)}
        </Text>
      </View>
      {direita}
    </Pressable>
  );
}

/** Mostra carregando / erro / lista vazia */
export function Estado({
  carregando,
  erro,
  vazio,
  mensagemVazio,
  onTentarDeNovo,
}: {
  carregando?: boolean;
  erro?: string | null;
  vazio?: boolean;
  mensagemVazio?: string;
  onTentarDeNovo?: () => void;
}) {
  if (carregando) {
    return (
      <View style={estilos.estado}>
        <ActivityIndicator color={cores.primaria} size="large" />
      </View>
    );
  }
  if (erro) {
    return (
      <View style={estilos.estado}>
        <Text style={estilos.erro}>{erro}</Text>
        {onTentarDeNovo && (
          <Pressable onPress={onTentarDeNovo} style={estilos.botao}>
            <Text style={estilos.botaoTexto}>Tentar de novo</Text>
          </Pressable>
        )}
      </View>
    );
  }
  if (vazio && mensagemVazio) {
    return (
      <View style={estilos.estado}>
        <Text style={estilos.sub}>{mensagemVazio}</Text>
      </View>
    );
  }
  return null;
}

export function Estrela({ ativa, onPress }: { ativa: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel={ativa ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Text style={{ fontSize: 24, color: ativa ? '#F2B01E' : cores.textoSuave }}>
        {ativa ? '★' : '☆'}
      </Text>
    </Pressable>
  );
}

export const estilos = StyleSheet.create({
  aviso: {
    backgroundColor: cores.alertaFundo,
    paddingHorizontal: espaco.g,
    paddingVertical: espaco.p,
  },
  avisoTexto: { color: cores.alerta, fontSize: 12 },
  cartao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.m,
    backgroundColor: cores.cartao,
    padding: espaco.m,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  letreiro: {
    backgroundColor: cores.primaria,
    borderRadius: 8,
    paddingHorizontal: espaco.p,
    paddingVertical: 6,
    minWidth: 76,
    alignItems: 'center',
  },
  letreiroTexto: { color: '#fff', fontWeight: '700', fontSize: 15 },
  destino: { fontSize: 16, fontWeight: '600', color: cores.texto },
  sub: { fontSize: 13, color: cores.textoSuave, marginTop: 2 },
  estado: { padding: espaco.gg, alignItems: 'center', gap: espaco.m },
  erro: { color: cores.primariaEscura, textAlign: 'center' },
  botao: {
    backgroundColor: cores.primaria,
    paddingHorizontal: espaco.g,
    paddingVertical: espaco.p + 2,
    borderRadius: 10,
  },
  botaoTexto: { color: '#fff', fontWeight: '600' },
  titulo: {
    fontSize: 13,
    fontWeight: '700',
    color: cores.textoSuave,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: espaco.g,
    marginBottom: espaco.p,
  },
});
