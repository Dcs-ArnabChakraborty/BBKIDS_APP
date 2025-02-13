import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import { CartProvider } from '@/constants/CartContext';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

export default function TabLayout() {
  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('TabLayout: Checking authentication...');
        const session = await AsyncStorage.getItem('user_session');
        console.log('TabLayout: Session found:', session);
        if (!session) {
          console.log('TabLayout: No session, redirecting to login...');
          router.replace('/login');
        }
      } catch (error) {
        console.error('TabLayout: Auth check failed:', error);
        router.replace('/login');
      }
    };
    
    checkAuth();
  }, []);

  return (
    <CartProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#666666',
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: {
            backgroundColor: '#000000',
            borderTopColor: '#333333',
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
          }}
        />
        
        <Tabs.Screen
          name="cart"
          options={{
            title: 'Cart',
            tabBarIcon: ({ color }) => <Ionicons name="cart" size={28} color={color} />
          }}
        />

        <Tabs.Screen
          name="orders"
          options={{
            title: 'Orders',
            tabBarIcon: ({ color }) => <Ionicons name="document-text" size={28} color={color} />
          }}
        />
      </Tabs>
    </CartProvider>
  );
}