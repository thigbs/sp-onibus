import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { api } from '../api';
import { estilos } from '../components/ui';
import { cores, espaco } from '../theme';

const INTEGRANTES = [
  { nome: 'Thiago Garcia Batista Santos', rm: 'RM568107' },
  { nome: 'Pedro César de Camargo Branco', rm: 'RM567971' },
  { nome: 'Renan Rodrigues de Matos Almeida', rm: 'RM567952' },
];

export default function SobreScreen() {
  const conectado = api.modo === 'api';

  return (
    <ScrollView
      style={{ backgroundColor: cores.fundo }}
      contentContainerStyle={{ padding: espaco.g, gap: espaco.m }}
    >
      <View style={s.cartao}>
        <Text style={s.titulo}>SP Ônibus 🚌</Text>
        <Text style={s.texto}>
          Aplicativo que ajuda o cidadão de São Paulo a se deslocar de ônibus: busque
          linhas, acompanhe os ônibus no mapa em tempo real e veja a previsão de chegada
          nas paradas. Linhas e paradas favoritas ficam salvas no próprio celular.
        </Text>
      </View>

      <View style={s.cartao}>
        <Text style={estilos.titulo}>Fonte dos dados</Text>
        <Text style={s.texto}>API Olho Vivo da SPTrans</Text>
        <View style={s.status}>
          <View
            style={[s.bolinha, { backgroundColor: conectado ? cores.sucesso : cores.alerta }]}
          />
          <Text style={s.texto}>
            {conectado ? 'Conectado à API da SPTrans' : 'Modo demonstração (sem token)'}
          </Text>
        </View>
      </View>

      <View style={s.cartao}>
        <Text style={estilos.titulo}>Integrantes</Text>
        {INTEGRANTES.map((i) => (
          <View key={i.rm} style={s.integrante}>
            <Text style={s.nome}>{i.nome}</Text>
            <Text style={estilos.sub}>{i.rm}</Text>
          </View>
        ))}
      </View>

      <Text style={[estilos.sub, { textAlign: 'center' }]}>
        Global Solution · Cross-Platform Application Development · FIAP
      </Text>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cartao: {
    backgroundColor: cores.cartao,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: espaco.g,
  },
  titulo: { fontSize: 22, fontWeight: '700', color: cores.texto, marginBottom: espaco.p },
  texto: { fontSize: 15, color: cores.texto, lineHeight: 21 },
  status: { flexDirection: 'row', alignItems: 'center', gap: espaco.p, marginTop: espaco.p },
  bolinha: { width: 10, height: 10, borderRadius: 5 },
  integrante: { paddingVertical: 6 },
  nome: { fontSize: 15, fontWeight: '600', color: cores.texto },
});
