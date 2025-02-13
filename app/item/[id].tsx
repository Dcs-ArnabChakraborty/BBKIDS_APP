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
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useCart } from '@/constants/CartContext';
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
const windowHeight = Dimensions.get('window').height;
const IMAGE_WIDTH = windowWidth * 0.9;
const IMAGE_HEIGHT = IMAGE_WIDTH;

interface SelectPickerProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  items: { label: string; value: string }[];
}

const SelectPicker: React.FC<SelectPickerProps> = ({
  label,
  value,
  onValueChange,
  items,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  return (
    <View style={styles.selectContainer}>
      <Text style={styles.selectLabel}>{label}</Text>
      <TouchableOpacity
        style={styles.selectButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectButtonText}>
          {items.find(item => item.value === value)?.label || `Select ${label}`}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#fff" />
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalView}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalHeaderText}>{`Select ${label}`}</Text>
              <TouchableOpacity 
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.pickerContentContainer}>
              {items.map(item => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.pickerItem,
                    value === item.value && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      value === item.value && styles.pickerItemTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {value === item.value && (
                    <Ionicons name="checkmark" size={24} color="#007AFF" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <TouchableOpacity 
            style={styles.backdropOverlay}
            activeOpacity={1} 
            onPress={() => setModalVisible(false)}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
};

interface ServiceFeatureProps {
  icon: string;
  text: string;
}

const ServiceFeature: React.FC<ServiceFeatureProps> = ({ icon, text }) => (
  <View style={styles.serviceFeature}>
    <Ionicons name={icon as any} size={20} color="#666" />
    <Text style={styles.serviceText}>{text}</Text>
  </View>
);

interface LocalSearchParams {
  id: string;
}

export default function ItemPage() {
  const { id } = useLocalSearchParams<LocalSearchParams>();
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
      const response = await GetSingleItems({ id });
      if (!response || !response.data) {
        console.error('No data received');
        return;
      }

      const itemData: Item = response.data;
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
    setSizeQuantities(prev => ({
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
          id,
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
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
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

          <View style={styles.selectorsContainer}>
            <SelectPicker
              label="Color"
              value={selectedColor}
              onValueChange={setSelectedColor}
              items={
                item.color?.map(c => ({ label: c.name, value: c.name })) || []
              }
            />

            <SelectPicker
              label="Pack Size"
              value={selectedPackSize}
              onValueChange={setSelectedPackSize}
              items={
                item.packsize?.map(p => ({ label: p.name, value: p.name })) || []
              }
            />

            <SelectPicker
              label="Shape"
              value={selectedShape}
              onValueChange={setSelectedShape}
              items={
                item.shape?.map(s => ({ label: s.name, value: s.name })) || []
              }
            />

            <SelectPicker
              label="Wear Type"
              value={selectedWearType}
              onValueChange={setSelectedWearType}
              items={
                item.wear_type?.map(w => ({ label: w.name, value: w.name })) || []
              }
            />
          </View>

          <Text style={styles.sectionTitle}>Size and Quantity:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.sizeContainer}>
              {item.size?.map(s => (
                <View key={s.name} style={styles.sizeCard}>
                  <Text style={styles.sizeText}>Size {s.name}</Text>
                  <TextInput
                    style={styles.quantityInput}
                    keyboardType="number-pad"
                    value={String(sizeQuantities[s.name] || 0)}
                    onChangeText={text =>
                      handleQuantityChange(s.name, parseInt(text) || 0)
                    }
                  />
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>

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
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#ffffff',
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
    backgroundColor: '#1a1a1a',
  },
  brand: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#ffffff',
  },
  selectorsContainer: {
    marginBottom: 24,
  },
  selectContainer: {
    marginBottom: 16,
  },
  selectLabel: {
    fontSize: 16,
    marginBottom: 8,
    color: '#ffffff',
  },
  selectButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    backgroundColor: '#262626',
  },
  selectButtonText: {
    color: '#ffffff',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
  },
  modalView: {
    backgroundColor: '#262626',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: windowHeight * 0.7,
    zIndex: 1,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalHeaderText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  pickerContentContainer: {
    paddingBottom: 16,
  },
  pickerItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  pickerItemSelected: {
    backgroundColor: '#333333',
  },
  pickerItemText: {
    color: '#ffffff',
    fontSize: 16,
  },
  pickerItemTextSelected: {
    color: '#007AFF',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#ffffff',
  },
  sizeContainer: {
    flexDirection: 'row',
  },
  sizeCard: {
    backgroundColor: '#262626',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8,
  },
  sizeText: {
    color: '#ffffff',
    marginBottom: 4,
  },
  quantityInput: {
    width: 40,
    height: 40,
    borderColor: '#333333',
    borderWidth: 1,
    color: '#ffffff',
    textAlign: 'center',
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
  },
  addToCartButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  addToCartText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  offersContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  offerCard: {
    backgroundColor: '#262626',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  offerTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  offerDetail: {
    color: '#ffffff',
    fontSize: 14,
  },
  serviceFeatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  serviceFeature: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceText: {
    marginLeft: 4,
    color: '#ffffff',
  },
});
