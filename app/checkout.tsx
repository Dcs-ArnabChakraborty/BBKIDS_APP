// Checkout.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCart } from '@/constants/CartContext';

interface CartItem {
  id: string;
  name: string;
  mrp: number;
  quantity: number;
  details?: {
    selectedColor?: string;
    selectedPackSize?: string;
    selectedShape?: string;
    selectedWearType?: string;
    sizeQuantities?: {
      [key: string]: number;
    };
  };
}

export default function Checkout() {
  const { cartItems } = useLocalSearchParams();
  const router = useRouter();
  const { removeMultipleItems } = useCart();
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([]);
  const [quantityInputs, setQuantityInputs] = useState<{
    [itemId: string]: { [size: string]: number };
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (cartItems) {
      const items = JSON.parse(String(cartItems));
      setSelectedItems(items);

      const initialQuantities: { [itemId: string]: { [size: string]: number } } = {};
      items.forEach((item: CartItem) => {
        if (item.details?.sizeQuantities) {
          initialQuantities[item.id] = {};
          Object.keys(item.details.sizeQuantities).forEach(size => {
            initialQuantities[item.id][size] = item.details.sizeQuantities[size] || 0;
          });
        }
      });
      setQuantityInputs(initialQuantities);
    }
  }, [cartItems]);

  const handleQuantityChange = (itemId: string, size: string, value: string) => {
    const quantity = parseInt(value, 10) || 0;
    setQuantityInputs(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [size]: quantity,
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      // Check if at least one item has a quantity > 0
      const hasQuantities = selectedItems.some(item =>
        Object.values(quantityInputs[item.id] || {}).some(quantity => quantity > 0)
      );

      if (!hasQuantities) {
        throw new Error('Please enter quantity for at least one item');
      }

      // Build the payload
      const payload = selectedItems.map(item => ({
        itemId: item.id,
        itemName: item.name,
        sizes: Object.entries(quantityInputs[item.id] || {}).map(([size, quantity]) => ({
          size,
          quantity: quantity || 0,
          price: item.mrp,
        })),
      }));

      // Retrieve user token from AsyncStorage (similar to localStorage)
      const userToken = await AsyncStorage.getItem('user_session');
      if (!userToken) {
        throw new Error('No authentication token found');
      }

      // Replace with your backend URL or ensure the environment variable is configured for React Native
      const backendUrl = process.env.EXPO_PUBLIC_BackendServerURL;
      if (!backendUrl) {
        throw new Error('Backend URL is not configured');
      }

      // Submit the order via a POST request
      const response = await fetch(`${backendUrl}/vls2/shopping_views/cart_proceed/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("order submitted", data);

      // Clear the cart and reset the page
      const selectedIds = selectedItems.map(item => item.id);
      removeMultipleItems(selectedIds);
      setSelectedItems([]);
      setQuantityInputs({});
      Alert.alert('Success', 'Order placed successfully!', [
        { text: 'OK', onPress: () => router.push('/(tabs)/cart') }
      ]);

    } catch (error) {
      console.error('Submission error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to place order';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No items selected for checkout</Text>
          <Text style={styles.emptySubtext}>
            Please go back to your cart and select items to proceed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

   return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Checkout</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {selectedItems.map((item) => (
          <View key={item.id} style={styles.itemContainer}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>₹{item.mrp.toFixed(2)}</Text>

            {item.details && (
              <View style={styles.detailsContainer}>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Color:</Text>
                    <Text style={styles.detailValue}>
                      {item.details.selectedColor || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Pack Size:</Text>
                    <Text style={styles.detailValue}>
                      {item.details.selectedPackSize || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Shape:</Text>
                    <Text style={styles.detailValue}>
                      {item.details.selectedShape || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Wear Type:</Text>
                    <Text style={styles.detailValue}>
                      {item.details.selectedWearType || "N/A"}
                    </Text>
                  </View>
                </View>

                {item.details.sizeQuantities && Object.keys(item.details.sizeQuantities).length > 0 && (
                  <ScrollView horizontal style={styles.tableContainer}>
                    <View>
                      <View style={styles.tableHeader}>
                        {Object.keys(item.details.sizeQuantities).map((size) => (
                          <View key={size} style={styles.headerCell}>
                            <Text style={styles.headerText}>{size}</Text>
                          </View>
                        ))}
                      </View>
                      <View style={styles.tableRow}>
                        {Object.keys(item.details.sizeQuantities).map((size) => (
                          <View key={size} style={styles.cell}>
                            <TextInput
                              style={styles.quantityInput}
                              keyboardType="numeric"
                              value={String(quantityInputs[item.id]?.[size] || 0)}
                              onChangeText={(value) =>
                                handleQuantityChange(item.id, size, value)
                              }
                            />
                          </View>
                        ))}
                      </View>
                    </View>
                  </ScrollView>
                )}
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Text style={styles.submitButtonText}>
            {isSubmitting ? 'Processing...' : 'Confirm Order'}
          </Text>
          {isSubmitting && <ActivityIndicator color="#fff" style={styles.loader} />}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
  },
  itemContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#60A5FA',
    marginBottom: 12,
  },
  detailsContainer: {
    marginTop: 8,
  },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  detailItem: {
    width: '50%',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D1D5DB',
  },
  detailValue: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  tableContainer: {
    marginBottom: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  headerCell: {
    padding: 12,
    width: 80,
    alignItems: 'center',
  },
  headerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
  },
  cell: {
    padding: 8,
    width: 80,
    alignItems: 'center',
  },
  quantityInput: {
    backgroundColor: '#374151',
    padding: 8,
    borderRadius: 4,
    width: 60,
    color: '#fff',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loader: {
    marginLeft: 8,
  },
});
