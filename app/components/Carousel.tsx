import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  ActivityIndicator,
  Animated,
  PanResponder,
  Pressable,
  Linking,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface CarouselProps {
  images: string[];
}

interface Slide {
  id: number;
  image: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function Carousel({ images }: CarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const translateX = new Animated.Value(0);

  // Convert images array to slides
  const slides: Slide[] = images.map((image, index) => ({
    id: index,
    image: image
  }));

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    const next = (currentSlide + 1) % slides.length;
    setCurrentSlide(next);
    Animated.spring(translateX, {
      toValue: -next * SCREEN_WIDTH,
      useNativeDriver: true,
    }).start();
  }, [currentSlide, slides.length]);

  const previousSlide = useCallback(() => {
    if (slides.length === 0) return;
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    setCurrentSlide(prev);
    Animated.spring(translateX, {
      toValue: -prev * SCREEN_WIDTH,
      useNativeDriver: true,
    }).start();
  }, [currentSlide, slides.length]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    Animated.spring(translateX, {
      toValue: -index * SCREEN_WIDTH,
      useNativeDriver: true,
    }).start();
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, { dx }) => {
      translateX.setValue(-currentSlide * SCREEN_WIDTH + dx);
    },
    onPanResponderRelease: (_, { dx }) => {
      if (Math.abs(dx) > SCREEN_WIDTH * 0.2) {
        if (dx > 0) {
          previousSlide();
        } else {
          nextSlide();
        }
      } else {
        Animated.spring(translateX, {
          toValue: -currentSlide * SCREEN_WIDTH,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isAutoPlaying && slides.length > 0) {
      intervalId = setInterval(nextSlide, 5000);
    }
    return () => clearInterval(intervalId);
  }, [isAutoPlaying, slides.length, nextSlide]);

  if (!slides.length) {
    return (
      <View style={styles.emptyContainer}>
        <Text>No images available</Text>
      </View>
    );
  }

  return (
    <View
      style={styles.container}
      onTouchStart={() => setIsAutoPlaying(false)}
      onTouchEnd={() => setIsAutoPlaying(true)}
    >
      <Animated.View
        style={[
          styles.slidesContainer,
          {
            transform: [{ translateX }],
          },
        ]}
        {...panResponder.panHandlers}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <Image source={{ uri: slide.image }} style={styles.image} />
          </View>
        ))}
      </Animated.View>

      <TouchableOpacity style={styles.prevButton} onPress={previousSlide}>
        <ChevronLeft color="white" size={24} />
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.nextButton} onPress={nextSlide}>
        <ChevronRight color="white" size={24} />
      </TouchableOpacity>

      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => goToSlide(index)}
            style={[
              styles.paginationDot,
              currentSlide === index && styles.paginationDotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    position: 'relative',
  },
  slidesContainer: {
    flexDirection: 'row',
  },
  slide: {
    width: SCREEN_WIDTH,
    height: '100%',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  prevButton: {
    position: 'absolute',
    left: 16,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  nextButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -20 }],
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    padding: 8,
  },
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 16,
    alignSelf: 'center',
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 4,
  },
  paginationDotActive: {
    backgroundColor: 'white',
  },
  emptyContainer: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
});