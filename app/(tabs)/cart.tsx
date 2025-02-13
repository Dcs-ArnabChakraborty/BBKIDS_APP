// CartPage.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '@/constants/CartContext';
import { useRouter } from 'expo-router';

const CartPage = () => {
  const router = useRouter();
  const { cart, removeFromCart } = useCart();
  // Maintain an array of selected item IDs for checkout
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Toggle selection status of an item when pressed
  const toggleSelect = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  // Calculate total only for selected items
  const calculateTotal = () => {
    return cart
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => total + item.mrp * item.quantity, 0);
  };

  // Proceed to checkout only with selected items
  const handleCheckout = () => {
    if (selectedItems.length > 0) {
      const selectedCartItems = cart.filter(item =>
        selectedItems.includes(item.id)
      );
      router.push({
        pathname: '/checkout',
        params: { cartItems: JSON.stringify(selectedCartItems) },
      });
    } else {
      alert('Please select at least one item to proceed to checkout.');
    }
  };

  if (cart.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyCart}>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.shopButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {cart.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={[
              styles.cartItem,
              selectedItems.includes(item.id) && styles.cartItemSelected,
            ]}
            onPress={() => toggleSelect(item.id)}
          >
            <View style={styles.checkboxContainer}>
              {selectedItems.includes(item.id) ? (
                <Ionicons name="checkbox" size={24} color="#007AFF" />
              ) : (
                <Ionicons name="square-outline" size={24} color="#007AFF" />
              )}
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>₹{item.mrp}</Text>
              {item.details && (
                <View style={styles.itemDetails}>
                  {item.details.selectedColor && (
                    <Text style={styles.itemDetailText}>
                      Color: {item.details.selectedColor}
                    </Text>
                  )}
                  {item.details.selectedPackSize && (
                    <Text style={styles.itemDetailText}>
                      Size: {item.details.selectedPackSize}
                    </Text>
                  )}
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeFromCart(item.id)}
            >
              <Ionicons name="trash" size={24} color="#FF3B30" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>₹{calculateTotal().toFixed(2)}</Text>
        </View>

        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a', // Dark background
  },
  scrollView: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333', // Darker border
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartItemSelected: {
    backgroundColor: '#333', // Highlight selected item
  },
  checkboxContainer: {
    marginRight: 10,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff', // White text
  },
  itemPrice: {
    fontSize: 14,
    color: '#ccc', // Light gray text
    marginTop: 4,
  },
  itemDetails: {
    marginTop: 4,
  },
  itemDetailText: {
    color: '#aaa', // Gray text for details
  },
  removeButton: {
    padding: 8,
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#333', // Darker border
    backgroundColor: '#1a1a1a', // Match background
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '500',
    color: '#fff', // White text
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff', // White text
  },
  checkoutButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyCartText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#fff', // White text
  },
  shopButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default CartPage;
