import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Pressable,
  useWindowDimensions,
  Platform,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GetSearchItems } from '@/utils/api';

interface SearchItem {
  unique_id: string;
  name: string;
  des: string | null;
  mrp: number;
  img: string;
}

interface SearchResponse {
  search: SearchItem[];
}

export default function SearchResultsScreen() {
  const params = useLocalSearchParams();
  const query = params?.query as string;
  const decodedQuery = query ? decodeURIComponent(query) : '';
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const [searchResults, setSearchResults] = useState<SearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSearchResults = async () => {
    if (!decodedQuery) {
      setError('No search query provided');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await GetSearchItems(decodedQuery);
      
      if (response?.data?.search) {
        setSearchResults(response.data.search);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch search results');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSearchResults();
  }, [decodedQuery]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchSearchResults();
  }, [decodedQuery]);

  const getGridDimensions = () => {
    const isLargeScreen = width >= 768;
    const containerPadding = 16 * 2;
    const spacing = isLargeScreen ? 8 : 16;
    const numColumns = isLargeScreen ? 3 : 2;
    const totalSpacing = containerPadding + spacing * (numColumns - 1);
    const cardWidth = (width - totalSpacing) / numColumns;

    return { numColumns, cardWidth, spacing };
  };

  const { numColumns, cardWidth, spacing } = getGridDimensions();

  const renderItem = ({ item }: { item: SearchItem }) => (
    <Pressable
      style={[styles.itemContainer, { width: cardWidth, marginBottom: spacing }]}
      onPress={() =>
        router.push({
          pathname: '/item/[id]',
          params: { id: item.unique_id },
        })
      }
    >
      <View style={styles.card}>
        <Image
          source={{ uri: item.img || 'https://via.placeholder.com/400x300' }}
          style={[styles.image, { height: cardWidth * 0.75 }]}
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text numberOfLines={2} style={styles.itemName}>
            {item.name}
          </Text>
          <Text numberOfLines={2} style={styles.description}>
            {item.des || 'No description available'}
          </Text>
          <Text style={styles.price}>Rs.{item.mrp.toLocaleString()}</Text>
        </View>
      </View>
    </Pressable>
  );

  const ContentView = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />;
    }

    if (error) {
      return <Text style={styles.errorText}>{error}</Text>;
    }

    if (!searchResults || searchResults.length === 0) {
      return <Text style={styles.noItemsText}>No results found for "{decodedQuery}"</Text>;
    }

    return (
      <FlatList
        data={searchResults}
        renderItem={renderItem}
        keyExtractor={(item) => item.unique_id}
        numColumns={numColumns}
        contentContainerStyle={[styles.listContent, { paddingBottom: insets.bottom + spacing }]}
        columnWrapperStyle={numColumns > 1 ? { justifyContent: 'space-between', marginBottom: spacing } : undefined}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#fff" />}
        showsVerticalScrollIndicator={false}
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Text style={[styles.title, { marginTop: Platform.OS === 'ios' ? 0 : 16 }]}>
        Search Results: {decodedQuery}
      </Text>
      <ContentView />
    </View>
  );
}
// ... (all imports and component code remain the same until the styles)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    backgroundColor: '#1a1a1a',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  itemContainer: {
    // marginBottom is set dynamically in renderItem based on spacing
  },
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  image: {
    width: '100%',
    backgroundColor: '#2D3748',
  },
  cardContent: {
    padding: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    lineHeight: 20,
  },
  description: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 16,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 4,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  noItemsText: {
    color: '#6B7280',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  loader: {
    marginTop: 20,
  },
});