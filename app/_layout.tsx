import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar, Platform, View } from 'react-native';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { CartProvider } from '@/constants/CartContext';
import CustomHeader from '@/app/components/CustomHeader';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <CartProvider>
      <ThemeProvider value={DarkTheme}>
        <View style={{ flex: 1, backgroundColor: '#000000' }}>
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: '#000000' },
              headerStyle: { backgroundColor: '#000000' },
              headerTintColor: '#FFFFFF',
            }}>
            <Stack.Screen 
              name="(tabs)" 
              options={{ 
                headerShown: true,
                header: () => <CustomHeader />
              }} 
            />
            <Stack.Screen 
              name="section/[name]" 
              options={{
                title: 'Category',
                headerTitle: 'Fashion Category',
                headerShown: true,
                headerTintColor: '#FFFFFF',
                contentStyle: { backgroundColor: '#000000' }
              }} 
            />
            <Stack.Screen 
              name="item/[id]" 
              options={{
                title: 'Product Details',
                headerTitle: 'Product Details',
                headerShown: true,
                headerTintColor: '#FFFFFF',
                contentStyle: { backgroundColor: '#000000' }
              }} 
            />
            <Stack.Screen 
              name="login" 
              options={{
                headerTitle: 'Welcome to BBKIDS',
                headerShown: true,
                presentation: 'modal',
                headerTintColor: '#FFFFFF',
                contentStyle: { backgroundColor: '#000000' }
              }} 
            />
            <Stack.Screen 
              name="checkout" 
              options={{
                title: 'Checkout',
                headerTitle: 'Checkout',
                headerShown: true,
                presentation: 'modal',
                headerTintColor: '#FFFFFF',
                contentStyle: { backgroundColor: '#000000' }
              }} 
            />
            <Stack.Screen 
              name="search" 
              options={{
                headerShown: true,
                headerTitle: 'Search Products',
                header: () => <CustomHeader />,
                contentStyle: { backgroundColor: '#000000' }
              }} 
            />
          </Stack>
          <StatusBar style="light" />
        </View>
      </ThemeProvider>
    </CartProvider>
  );
}