// app/item/[id].tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCart } from '@/constants/CartContext';
import { Picker } from '@react-native-picker/picker';
import Carousel from 'react-native-reanimated-carousel';
import { Ionicons } from '@expo/vector-icons';
import { GetSingleItems } from '@/utils/api';

interface Item {
  id: string;
  brand: string;
  mrp: number;
  color: { name: string }[];
  packsize: { name: string }[];
  size: { name: string }[];
  pics: { image: string }[];
  shape: { name: string }[];
  wear_type: { name: string }[];
  res: boolean;
}

const windowWidth = Dimensions.get('window').width;
// Reduce the image size to 90% of the device width.
const IMAGE_WIDTH = windowWidth * 0.9;
const IMAGE_HEIGHT = IMAGE_WIDTH;

const SelectPicker = ({
  label,
  value,
  onValueChange,
  items,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  if (Platform.OS === 'android') {
    return (
      <View style={styles.selectContainer}>
        <Text style={styles.selectLabel}>{label}</Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setModalVisible(true)}
        >
          <Text>{value || `Select ${label}`}</Text>
          <Ionicons name="chevron-down" size={20} color="#666" />
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
          >
            <View style={styles.modalContent}>
              <Picker
                selectedValue={value}
                onValueChange={(itemValue) => {
                  onValueChange(itemValue);
                  setModalVisible(false);
                }}
              >
                {items.map((item) => (
                  <Picker.Item
                    key={item.value}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </Picker>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    );
  }

  return (
    <View style={styles.selectContainer}>
      <Text style={styles.selectLabel}>{label}</Text>
      <Picker selectedValue={value} onValueChange={onValueChange} style={styles.picker}>
        {items.map((item) => (
          <Picker.Item key={item.value} label={item.label} value={item.value} />
        ))}
      </Picker>
    </View>
  );
};

const ServiceFeature = ({ icon, text }: { icon: string; text: string }) => (
  <View style={styles.serviceFeature}>
    <Ionicons name={icon as any} size={20} color="#666" />
    <Text style={styles.serviceText}>{text}</Text>
  </View>
);

export default function ItemPage() {
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();
  const [item, setItem] = useState<Item | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedWearType, setSelectedWearType] = useState<string>('');
  const [selectedPackSize, setSelectedPackSize] = useState<string>('');
  const [selectedShape, setSelectedShape] = useState<string>('');
  const [sizeQuantities, setSizeQuantities] = useState<{ [key: string]: number }>({});

  const offers = [
    {
      title: 'EMI & Payment Info',
      details: ['EMI starting from $20/month'],
    },
    {
      title: 'Cashback Offer',
      details: ['Get 5% cashback'],
    },
    {
      title: 'Bank Offer',
      details: ['10% instant discount'],
    },
  ];

  useEffect(() => {
    fetchItem();
  }, [id]);

  const fetchItem = async () => {
    try {
      const response = await GetSingleItems({ id: id as string });
      if (!response || !response.data) {
        console.error('No data received');
        return;
      }

      const itemData = response.data;
      setItem(itemData);

      setSelectedColor(itemData.color?.[0]?.name || '');
      setSelectedPackSize(itemData.packsize?.[0]?.name || '');
      setSelectedWearType(itemData.wear_type?.[0]?.name || '');
      setSelectedShape(itemData.shape?.[0]?.name || '');

      if (itemData.size?.length > 0) {
        const initialSizeQuantities = itemData.size.reduce(
          (acc: Record<string, number>, size: { name: string }) => {
            acc[size.name] = 0;
            return acc;
          },
          {}
        );
        setSizeQuantities(initialSizeQuantities);
      }
    } catch (error) {
      console.error('Error fetching item:', error);
    }
  };

  const handleQuantityChange = (size: string, quantity: number) => {
    setSizeQuantities((prev) => ({
      ...prev,
      [size]: quantity,
    }));
  };

  const handleAddToCart = () => {
    if (!item) {
      Alert.alert('Error', 'Item data is not available.');
      return;
    }

    const totalQuantity = Object.values(sizeQuantities).reduce(
      (sum, quantity) => sum + quantity,
      0
    );

    if (totalQuantity > 0) {
      const filteredSizeQuantities = Object.entries(sizeQuantities).reduce(
        (acc, [size, quantity]) => {
          if (quantity > 0) {
            acc[size] = quantity;
          }
          return acc;
        },
        {} as Record<string, number>
      );

      try {
        addToCart({
          id: id as string,
          name: item.brand,
          mrp: item.mrp,
          quantity: totalQuantity,
          details: {
            selectedColor,
            selectedPackSize,
            selectedShape,
            selectedWearType,
            sizeQuantities: filteredSizeQuantities,
          },
        });

        Alert.alert('Success', 'Item added to cart successfully');
      } catch (error) {
        Alert.alert('Error', 'Failed to add item to cart. Please try again.');
      }
    } else {
      Alert.alert('Error', 'Please select at least one item size and quantity.');
    }
  };

  const renderCarouselItem = ({ item: pic }: { item: { image: string } }) => (
    <Image
      source={{ uri: pic.image }}
      style={styles.carouselImage}
      resizeMode="cover"
    />
  );

  if (!item) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Image Carousel */}
        <View style={styles.carouselContainer}>
          <Carousel
            data={item.pics || []}
            renderItem={renderCarouselItem}
            width={IMAGE_WIDTH}
            height={IMAGE_HEIGHT}
            autoPlay
            loop
          />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.brand}>{item.brand}</Text>
          <Text style={styles.price}>₹{item.mrp}</Text>

          {/* Selectors */}
          <View style={styles.selectorsContainer}>
            <SelectPicker
              label="Color"
              value={selectedColor}
              onValueChange={setSelectedColor}
              items={item.color?.map((c) => ({ label: c.name, value: c.name })) || []}
            />

            <SelectPicker
              label="Pack Size"
              value={selectedPackSize}
              onValueChange={setSelectedPackSize}
              items={item.packsize?.map((p) => ({ label: p.name, value: p.name })) || []}
            />

            <SelectPicker
              label="Shape"
              value={selectedShape}
              onValueChange={setSelectedShape}
              items={item.shape?.map((s) => ({ label: s.name, value: s.name })) || []}
            />

            <SelectPicker
              label="Wear Type"
              value={selectedWearType}
              onValueChange={setSelectedWearType}
              items={item.wear_type?.map((w) => ({ label: w.name, value: w.name })) || []}
            />
          </View>

          {/* Size Quantities */}
          <Text style={styles.sectionTitle}>Size and Quantity:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sizeContainer}>
              {item.size?.map((s) => (
                <View key={s.name} style={styles.sizeCard}>
                  <Text style={styles.sizeText}>Size {s.name}</Text>
                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="number-pad"
                    value={String(sizeQuantities[s.name] || 0)}
                    onChangeText={(text) =>
                      handleQuantityChange(s.name, parseInt(text) || 0)
                    }
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Add to Cart Button */}
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>

          {/* Offers */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.offersContainer}>
              {offers.map((offer, index) => (
                <View key={index} style={styles.offerCard}>
                  <Text style={styles.offerTitle}>{offer.title}</Text>
                  {offer.details.map((detail, idx) => (
                    <Text key={idx} style={styles.offerDetail}>
                      {detail}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          </ScrollView>

          {/* Service Features */}
          <View style={styles.serviceFeatures}>
            <ServiceFeature icon="refresh" text="7 Day Replacement" />
            <ServiceFeature icon="car" text="Free Delivery" />
            <ServiceFeature icon="card" text="Pay on Delivery" />
            <ServiceFeature icon="cash" text="1 Year Warranty" />
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center', // Center the carousel horizontally
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  carouselContainer: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    marginVertical: 16,
  },
  carouselImage: {
    width: IMAGE_WIDTH,
    height: IMAGE_HEIGHT,
    borderRadius: 8,
  },
  detailsContainer: {
    padding: 16,
    width: '100%',
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  selectorsContainer: {
    gap: 16,
    marginBottom: 24,
  },
  selectContainer: {
    marginBottom: 16,
  },
  selectLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#666',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sizeContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  sizeCard: {
    padding: 12,
    width: 120,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    alignItems: 'center',
  },
  sizeText: {
    textAlign: 'center',
    marginBottom: 8,
  },
  quantityInput: {
    width: 60,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginVertical: 16,
    alignItems: 'center',
  },
  addToCartText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  offersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
  },
  offerCard: {
    padding: 12,
    width: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  offerDetail: {
    fontSize: 12,
    color: '#666',
  },
  serviceFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    marginTop: 16,
  },
  serviceFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  serviceText: {
    fontSize: 12,
    color: '#666',
  },
});

export default ItemPage;
