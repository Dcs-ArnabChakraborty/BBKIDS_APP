import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { GetAllOrders } from '../../utils/api';

interface Order {
  brand: string;
  category: string;
  name: string;
  wear_type: string;
  shape: string;
  color: string;
  packsize: string;
  size: string;
  qty: number;
  cost: number;
  status: 'Delivered' | 'Cancelled' | 'Pending';
}

// Function to get status color
const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'Delivered':
      return '#10B981'; // Green
    case 'Cancelled':
      return '#DC2626'; // Red
    case 'Pending':
      return '#2563EB'; // Blue
    default:
      return '#6B7280'; // Default gray
  }
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await GetAllOrders();
        console.log('API Response all orders:', data);

        setOrders(data.RES as Order[] || []);
      } catch (err) {
        setError('Failed to load orders');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>My Orders</Text>
        {orders.length === 0 ? (
          <Text style={styles.noOrdersText}>No orders found</Text>
        ) : (
          orders.map((order, index) => (
            <TouchableOpacity key={index} style={styles.orderCard}>
              {/* Status Badge on the Top Right */}
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                <Text style={styles.statusText}>{order.status}</Text>
              </View>

              {/* Order Details */}
              <Text style={styles.itemName}>Name: {order.name}</Text>
              <Text style={styles.itemDetails}>Category: {order.category}</Text>
              <Text style={styles.itemDetails}>Brand: {order.brand}</Text>
              <Text style={styles.itemDetails}>Wear Type: {order.wear_type}</Text>
              <Text style={styles.itemDetails}>Shape: {order.shape}</Text>
              <Text style={styles.itemDetails}>Color: {order.color}</Text>
              <Text style={styles.itemDetails}>Pack Size: {order.packsize}</Text>
              <Text style={styles.itemDetails}>Size: {order.size}</Text>
              <Text style={styles.itemDetails}>Quantity: {order.qty}</Text>
              <Text style={styles.itemPrice}>Cost: ₹{order.cost}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000', // Black background
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#F87171', // Light red error text
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#F3F4F6', // Light text for dark mode
  },
  noOrdersText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#9CA3AF', // Light gray text
  },
  orderCard: {
    backgroundColor: '#1F2937', // Dark gray card background
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F3F4F6', // Light text for contrast
  },
  itemDetails: {
    fontSize: 14,
    color: '#9CA3AF', // Light gray text
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#60A5FA', // Blue price text
    marginTop: 2,
  },
});
