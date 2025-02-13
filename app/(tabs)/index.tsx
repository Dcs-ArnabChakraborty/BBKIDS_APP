// app/index.tsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { router } from 'expo-router';
import { GetBannerData, GetCatagories } from '@/utils/api';
import Carousel from '../components/Carousel';

interface Section {
  name: string;
  image: string;
}

interface BannerData {
  banner_url: string;
}

export default function Dashboard() {
  const [sections, setSections] = useState<Section[]>([]);
  const [banners, setBanners] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const { width } = useWindowDimensions();
  const cardWidth = (width - 36) / 2;

  const processUrl = (url: string) => {
    // Remove double slashes except after protocol
    return url.replace(/([^:])\/\//g, '$1/');
  };

  const fetchData = async () => {
    try {
      console.log('🚀 Starting API fetch...');
      
      const [bannerResponse, categoriesResponse] = await Promise.all([
        GetBannerData(),
        GetCatagories(),
      ]);

      console.log('📊 Banner Response:', JSON.stringify(bannerResponse, null, 2));
      console.log('🗂️ Categories Response:', JSON.stringify(categoriesResponse, null, 2));

      if (bannerResponse?.data) {
        const bannerImages = bannerResponse.data.map((banner: BannerData) => 
          processUrl(banner.banner_url)
        );
        console.log('🖼️ Processed Banner Images:', bannerImages);
        setBanners(bannerImages);
      }

      if (categoriesResponse?.data) {
        console.log('📁 Setting sections with:', categoriesResponse.data);
        setSections(categoriesResponse.data);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      console.error('❌ Error fetching data:', err);
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />
      }
    >
      {banners.length > 0 && <Carousel images={banners} />}

      <Text style={styles.title}>Shop by Section</Text>

      <View style={styles.grid}>
        {sections.length > 0 ? (
          sections.map((section) => (
            <TouchableOpacity
              key={section.name}
              style={[styles.card, { width: cardWidth }]}
              onPress={() =>
                router.push({
                  pathname: '/section/[name]',
                  params: { name: section.name },
                })
              }
            >
              <Image
                source={{ uri: processUrl(section.image) }}
                style={styles.image}
                resizeMode="cover"
              />
              <View style={styles.cardContent}>
                <Text style={styles.sectionName}>{section.name}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.noCategories}>No categories available</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
    color: '#fff',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    justifyContent: 'space-between',
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    height: 150,
  },
  cardContent: {
    padding: 12,
  },
  sectionName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  noCategories: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    color: '#fff',
  },
});
