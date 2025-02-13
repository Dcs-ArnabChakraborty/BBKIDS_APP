import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';

const CustomHeader = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const checkUserSession = async () => {
      const userSession = await AsyncStorage.getItem('user_session');
      setIsLoggedIn(!!userSession);
    };

    checkUserSession();
  }, []);

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: 'search',
        params: { query: searchQuery.trim() }
      });
      setSearchQuery('');
    }
  };

  const handleAuthPress = async () => {
    if (isLoggedIn) {
      await AsyncStorage.removeItem('user_session');
      setIsLoggedIn(false);
      router.push('/login');
    } else {
      router.push('/login');
    }
  };

  const handleHomePress = () => {
    router.push('/');
  };

  return (
    <View style={styles.headerContainer}>
      <TouchableOpacity onPress={handleHomePress}>
        <Text style={styles.title}>BBKIDS</Text>
      </TouchableOpacity>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search..."
          placeholderTextColor="#999"
          onSubmitEditing={handleSearchSubmit}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchSubmit}>
          <Feather name="search" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.authButton} onPress={handleAuthPress}>
        {isLoggedIn ? 
          <Entypo name="log-out" size={24} color="#fff" /> :
          <Text style={styles.authButtonText}>Login</Text>
        }
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 10,
    backgroundColor: '#333',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 30,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: '#444',
    borderRadius: 5,
    color: '#fff',
    marginRight: 5,
  },
  searchButton: {
    backgroundColor: '#666',
    padding: 6,
    borderRadius: 5,
  },
  searchButtonText: {
    color: '#fff',
  },
  authButton: {
    paddingHorizontal: 10,
  },
  authButtonText: {
    fontSize: 16,
    color: '#fff',
  },
});

export default CustomHeader;