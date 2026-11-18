# SP Ônibus 🚌

Aplicativo mobile em **React Native** (Expo + TypeScript) que ajuda o cidadão de São Paulo a se deslocar de ônibus, usando a **API Olho Vivo da SPTrans** e salvando dados no próprio celular com **AsyncStorage**.

Global Solution — **Cross-Platform Application Development** · Ciência da Computação (2º ano, turma de agosto) · FIAP

## Integrantes

| Nome | RM |
| --- | --- |
| Thiago Garcia Batista Santos | RM568107 |
| Pedro César de Camargo Branco | RM567971 |
| Renan Rodrigues de Matos Almeida | RM567952 |

## Funcionalidades

- **Buscar linhas** pelo número (ex.: `8000`) ou pelo nome/bairro (ex.: `Lapa`), nos dois sentidos.
- **Ônibus no mapa**: mostra a posição dos ônibus da linha em tempo real (atualiza a cada 15 s), o trajeto e as paradas.
- **Previsão de chegada**: escolhendo uma parada, mostra quais linhas passam ali e em quantos minutos chega cada ônibus (atualiza a cada 20 s ou puxando a tela para baixo).
- **Favoritos**: linhas e paradas favoritas ficam salvas no celular.
- **Histórico de buscas**: as 10 últimas buscas ficam salvas e podem ser repetidas com um toque.
- **Acessibilidade**: indica os ônibus adaptados (♿).

## Como a API Olho Vivo é usada

| Tela | Endpoint |
| --- | --- |
| Login (automático) | `POST /Login/Autenticar?token=...` |
| Buscar | `GET /Linha/Buscar?termosBusca=...` |
| Linha (paradas) | `GET /Parada/BuscarParadasPorLinha?codigoLinha=...` |
| Linha (mapa) | `GET /Posicao/Linha?codigoLinha=...` |
| Parada | `GET /Previsao/Parada?codigoParada=...` |

Base: `https://api.olhovivo.sptrans.com.br/v2.1`. A autenticação gera um cookie de sessão, que o app reaproveita. Se a sessão expirar, o app faz o login de novo sozinho.

## Persistência local (AsyncStorage)

Em `src/storage/storage.ts`, os dados são salvos como JSON em três chaves:

- `@sp-onibus/linhas-favoritas`
- `@sp-onibus/paradas-favoritas`
- `@sp-onibus/historico-buscas`

## Como executar

Pré-requisitos: [Node.js](https://nodejs.org) (LTS) e o app **Expo Go** no celular (SDK 58).

```bash
git clone <link-deste-repositório>
cd sp-onibus
npm install
npx expo start
```

Depois é só escanear o QR Code com a câmera (iPhone) ou com o Expo Go (Android).

### Token da SPTrans

1. Crie uma conta em <https://www.sptrans.com.br/desenvolvedores/> e cadastre um aplicativo em **Meus Aplicativos** para receber o token.
2. Copie o arquivo `.env.example` para `.env.local`.
3. Cole o token: `EXPO_PUBLIC_SPTRANS_TOKEN=seu_token_aqui`.
4. Reinicie com `npx expo start -c`.

**Sem token, o app funciona em modo demonstração**, com linhas e ônibus de exemplo (uma faixa amarela avisa isso). O arquivo `.env.local` não vai para o GitHub, então o token não fica público.

## Estrutura

```
src/
├── App.tsx                 # navegação (abas + pilha)
├── navigation.ts           # tipos das rotas
├── theme.ts                # cores e espaçamentos
├── api/
│   ├── olhoVivo.ts         # cliente da API Olho Vivo
│   ├── exemplo.ts          # dados de exemplo (modo demonstração)
│   ├── types.ts            # tipos das respostas da API
│   └── index.ts            # escolhe API real ou exemplo
├── storage/storage.ts      # AsyncStorage (favoritos e histórico)
├── components/ui.tsx       # componentes reutilizáveis
└── screens/
    ├── BuscarScreen.tsx
    ├── LinhaScreen.tsx
    ├── ParadaScreen.tsx
    └── FavoritosScreen.tsx
```

## Tecnologias

React Native 0.88 · Expo SDK 58 · TypeScript · React Navigation 7 · react-native-maps · AsyncStorage
