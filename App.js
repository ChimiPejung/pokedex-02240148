import React from 'react';
import { Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TeamProvider } from './src/TeamContext';
import PokedexScreen from './src/screens/PokedexScreen';
import TeamScreen from './src/screens/TeamScreen';
import GameScreen from './src/screens/GameScreen';
import DetailScreen from './src/screens/DetailScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, primary: colors.red },
};

const tabIcon = (glyph) => ({ color }) => <Text style={{ fontSize: 20, color }}>{glyph}</Text>;

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false, // each screen draws its own Pokédex header
        tabBarActiveTintColor: colors.yellow,
        tabBarInactiveTintColor: '#8A94A1',
        tabBarStyle: { backgroundColor: colors.bezel, borderTopColor: colors.redDark, borderTopWidth: 3 },
        tabBarLabelStyle: { fontWeight: '800', fontSize: 11 },
      }}
    >
      <Tab.Screen name="Pokédex" component={PokedexScreen} options={{ tabBarIcon: tabIcon('📖') }} />
      <Tab.Screen name="My Team" component={TeamScreen} options={{ tabBarIcon: tabIcon('🎒') }} />
      <Tab.Screen name="Game" component={GameScreen} options={{ tabBarIcon: tabIcon('❓') }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <TeamProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Tabs" component={Tabs} />
            <Stack.Screen name="Detail" component={DetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </TeamProvider>
    </SafeAreaProvider>
  );
}
