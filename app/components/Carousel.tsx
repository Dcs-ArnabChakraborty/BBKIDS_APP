import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Animated,
  PanResponder,
  ActivityIndicator,
  Text,
  LayoutChangeEvent,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface CarouselProps {
  images: string[];
}

export default function Carousel({ images }: CarouselProps) {
  const [carouselWidth, setCarouselWidth] = useState(Dimensions.get('window').width);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const translateX = new Animated.Value(0);

  const slides = images.map((image, index) => ({
    id: index,
    image,
  }));

  const nextSlide = useCallback(() => {
    if (slides.length <= 1) return;
    const next = (currentSlide + 1) % slides.length;
    setCurrentSlide(next);
    Animated.spring(translateX, {
      toValue: -next * carouselWidth,
      useNativeDriver: true,
    }).start();
  }, [currentSlide, slides.length, carouselWidth]);

  const previousSlide = useCallback(() => {
    if (slides.length <= 1) return;
    const prev = (currentSlide - 1 + slides.length) % slides.length;
    setCurrentSlide(prev);
    Animated.spring(translateX, {
      toValue: -prev * carouselWidth,
      useNativeDriver: true,
    }).start();
  }, [currentSlide, slides.length, carouselWidth]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, { dx }) => {
      translateX.setValue(-currentSlide * carouselWidth + dx);
    },
    onPanResponderRelease: (_, { dx }) => {
      if (Math.abs(dx) > carouselWidth * 0.2) {
        if (dx > 0) previousSlide();
        else nextSlide();
      } else {
        Animated.spring(translateX, {
          toValue: -currentSlide * carouselWidth,
          useNativeDriver: true,
        }).start();
      }
    },
  });

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isAutoPlaying && slides.length > 1) {
      intervalId = setInterval(nextSlide, 5000);
    }
    return () => clearInterval(intervalId);
  }, [isAutoPlaying, slides.length, nextSlide]);

  // Update carouselWidth on layout changes for responsiveness
  const onLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setCarouselWidth(width);
    // Reset the translateX to match the current slide
    translateX.setValue(-currentSlide * width);
  };

  if (!slides.length) {
    return (
      <View style={[styles.emptyContainer, { width: carouselWidth }]}>
        <Text>No images available</Text>
      </View>
    );
  }

  const handleImageLoad = () => {
    setIsLoading(false);
    setLoadError(null);
  };

  const handleImageError = (error: any) => {
    console.error('Image loading error:', error.nativeEvent.error);
    setIsLoading(false);
    setLoadError('Failed to load image');
  };

  return (
    <View style={[styles.container, { width: '100%' }]} onLayout={onLayout}>
      <Animated.View
        style={[
          styles.slidesContainer,
          { width: carouselWidth * slides.length, transform: [{ translateX }] },
        ]}
        {...panResponder.panHandlers}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width: carouselWidth }]}>
            <Image
              source={{ uri: slide.image }}
              style={styles.image}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
            {isLoading && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
              </View>
            )}
            {loadError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{loadError}</Text>
              </View>
            )}
          </View>
        ))}
      </Animated.View>

      {slides.length > 1 && (
        <>
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
                onPress={() => {
                  setCurrentSlide(index);
                  Animated.spring(translateX, {
                    toValue: -index * carouselWidth,
                    useNativeDriver: true,
                  }).start();
                }}
                style={[
                  styles.paginationDot,
                  currentSlide === index && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 300,
    backgroundColor: '#f5f5f5',
    overflow: 'hidden',
  },
  slidesContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  slide: {
    height: '100%',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  loaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  errorText: {
    color: 'white',
    fontSize: 16,
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
    backgroundColor: '#f5f5f5',
  },
});
