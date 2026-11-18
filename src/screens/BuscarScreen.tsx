import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { api, type Linha } from '../api';
import { AvisoModoExemplo, CartaoLinha, Estado, estilos } from '../components/ui';
import type { RootStackParamList } from '../navigation';
import { adicionarAoHistorico, limparHistorico, listarHistorico } from '../storage/storage';
import { cores, espaco } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function BuscarScreen() {
  const navigation = useNavigation<Nav>();
  const [termo, setTermo] = useState('');
  const [linhas, setLinhas] = useState<Linha[]>([]);
  const [historico, setHistorico] = useState<string[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [buscou, setBuscou] = useState(false);

  useEffect(() => {
    listarHistorico().then(setHistorico);
  }, []);

  async function buscar(texto = termo) {
    const t = texto.trim();
    if (!t) return;
    setTermo(t);
    setCarregando(true);
    setErro(null);
    try {
      const resultado = await api.buscarLinhas(t);
      setLinhas(resultado);
      setHistorico(await adicionarAoHistorico(t));
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao buscar linhas.');
      setLinhas([]);
    } finally {
      setCarregando(false);
      setBuscou(true);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: cores.fundo }}>
      <AvisoModoExemplo />
      <View style={s.barraBusca}>
        <TextInput
          value={termo}
          onChangeText={setTermo}
          onSubmitEditing={() => buscar()}
          placeholder={api.modo === 'exemplo' ? 'Ex.: 7001 ou Pinheiros' : 'Ex.: 8000 ou Lapa'}
          placeholderTextColor={cores.textoSuave}
          returnKeyType="search"
          autoCorrect={false}
          style={s.input}
          accessibilityLabel="Número ou nome da linha"
        />
        <Pressable onPress={() => buscar()} style={estilos.botao}>
          <Text style={estilos.botaoTexto}>Buscar</Text>
        </Pressable>
      </View>

      <FlatList
        data={linhas}
        keyExtractor={(l) => String(l.cl)}
        contentContainerStyle={{ padding: espaco.g, gap: espaco.p }}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          !buscou && historico.length > 0 ? (
            <View>
              <View style={s.linhaTitulo}>
                <Text style={estilos.titulo}>Buscas recentes</Text>
                <Pressable
                  onPress={async () => {
                    await limparHistorico();
                    setHistorico([]);
                  }}
                >
                  <Text style={s.limpar}>Limpar</Text>
                </Pressable>
              </View>
              <View style={s.chips}>
                {historico.map((h) => (
                  <Pressable key={h} onPress={() => buscar(h)} style={s.chip}>
                    <Text style={{ color: cores.texto }}>{h}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          <Estado
            carregando={carregando}
            erro={erro}
            onTentarDeNovo={() => buscar()}
            vazio={buscou}
            mensagemVazio="Nenhuma linha encontrada. Tente outro número ou bairro."
          />
        }
        renderItem={({ item }) => (
          <CartaoLinha
            linha={item}
            onPress={() => navigation.navigate('Linha', { linha: item })}
          />
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  barraBusca: {
    flexDirection: 'row',
    gap: espaco.p,
    padding: espaco.g,
    paddingBottom: 0,
  },
  input: {
    flex: 1,
    backgroundColor: cores.cartao,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 10,
    paddingHorizontal: espaco.m,
    fontSize: 16,
    color: cores.texto,
    minHeight: 44,
  },
  linhaTitulo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  limpar: { color: cores.primaria, marginTop: espaco.g, fontWeight: '600' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.p },
  chip: {
    backgroundColor: cores.cartao,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 20,
    paddingHorizontal: espaco.m,
    paddingVertical: 6,
  },
});
