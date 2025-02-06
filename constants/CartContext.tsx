// CartContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type CartItem = {
  id: string;
  name: string;
  mrp: number;
  quantity: number;
  details?: {
    selectedColor?: string; 
    selectedPackSize?: string;
    selectedShape?: string;
    selectedWearType?: string;
    sizeQuantities?: Record<string, number>;
  };
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  removeMultipleItems: (ids: string[]) => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from AsyncStorage on mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const savedCart = await AsyncStorage.getItem('cart');
        if (savedCart) {
          setCart(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Error loading cart:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart to AsyncStorage whenever it changes
  useEffect(() => {
    const saveCart = async () => {
      try {
        await AsyncStorage.setItem('cart', JSON.stringify(cart));
      } catch (error) {
        console.error('Error saving cart:', error);
      }
    };

    if (!isLoading) {
      saveCart();
    }
  }, [cart, isLoading]);

  const addToCart = async (item: CartItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === item.id);
      if (existingItem) {
        return prevCart.map(i =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = async (id: string) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(i => i.id === id);
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(i =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        );
      }
      return prevCart.filter(i => i.id !== id);
    });
  };

  const clearCart = async () => {
    try {
      await AsyncStorage.removeItem('cart');
      setCart([]);
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const removeMultipleItems = async (ids: string[]) => {
    setCart(prevCart => prevCart.filter(item => !ids.includes(item.id)));
  };

  if (isLoading) {
    return null; // Or return a loading spinner
  }

  return (
    <CartContext.Provider 
      value={{ 
        cart, 
        addToCart, 
        removeFromCart, 
        clearCart, 
        removeMultipleItems 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};