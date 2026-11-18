import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import type { RootStackParamList } from './navigation';
import BuscarScreen from './screens/BuscarScreen';
import FavoritosScreen from './screens/FavoritosScreen';
import LinhaScreen from './screens/LinhaScreen';
import ParadaScreen from './screens/ParadaScreen';
import { cores } from './theme';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tabs = createBottomTabNavigator();

const cabecalho = {
  headerStyle: { backgroundColor: cores.primaria },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '700' as const },
};

function Abas() {
  return (
    <Tabs.Navigator
      screenOptions={{
        ...cabecalho,
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
      }}
    >
      <Tabs.Screen
        name="Buscar"
        component={BuscarScreen}
        options={{
          title: 'SP Ônibus',
          tabBarLabel: 'Buscar',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔍</Text>,
        }}
      />
      <Tabs.Screen
        name="Favoritos"
        component={FavoritosScreen}
        options={{
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>★</Text>,
        }}
      />
    </Tabs.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator screenOptions={{ ...cabecalho, headerBackTitle: 'Voltar' }}>
          <Stack.Screen name="Abas" component={Abas} options={{ headerShown: false }} />
          <Stack.Screen name="Linha" component={LinhaScreen} />
          <Stack.Screen name="Parada" component={ParadaScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
