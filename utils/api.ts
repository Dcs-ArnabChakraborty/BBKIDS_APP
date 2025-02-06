import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const BASE_URL = process.env.EXPO_PUBLIC_BackendServerURL;

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${BASE_URL}/vls2/shopping_views/loging_url/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_name: email, password }),
  });
  
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Login failed');
  }
  
  return response.json();
};

export const GetBannerData = async () => {
  const token = await AsyncStorage.getItem('user_session');
  const response = await fetch(`${BASE_URL}/vls2/shopping_views/banner_url/`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
    },
  });
  
  if (response.status === 401) {
    router.replace('/');
    return;
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message);
  }
  
  return response.json();
};

export const GetCatagories = async () => {
  const token = await AsyncStorage.getItem('user_session');
  const response = await fetch(`${BASE_URL}/vls2/shopping_views/category_list_url/`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
    },
  });
  
  if (response.status === 401) {
    router.replace('/');
    return;
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message);
  }

  return response.json();
};

export const GetFilteredSectionDetails = async (filterCriteria: { category: string }) => {
  const token = await AsyncStorage.getItem('user_session');
  const response = await fetch(`${BASE_URL}/vls2/shopping_views/category_item_url/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(filterCriteria),
  });
  
  if (response.status === 401) {
    router.replace('/');
    return;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch filtered section details');
  }
  
  return await response.json();
};

export const GetSingleItems = async ({ id }: { id: string }) => {
  const token = await AsyncStorage.getItem('user_session');
  const response = await fetch(`${BASE_URL}/vls2/shopping_views/single_item_view/?id=${id}`, {
    method: 'GET',
    headers: {
      'Authorization': `Token ${token}`,
    },
  });
  
  if (response.status === 401) {
    router.replace('/');
    return;
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message);
  }

  return response.json();
};

export const AddToCart = async (dataToSend: any) => {
  const token = await AsyncStorage.getItem('user_session');
  const response = await fetch(`${BASE_URL}/vls2/shopping_views/order_entry/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dataToSend),
  });
  
  if (response.status === 401) {
    router.replace('/');
    return;
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to add to cart');
  }

  return response.json();
};

export const submitCartToAPI = async (cartData: any) => {
  try {
    const token = await AsyncStorage.getItem('user_session');
    const response = await fetch(`${BASE_URL}/vls2/shopping_views/add_cart/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cartData),
    });
    
    if (response.status === 401) {
      router.replace('/');
      return;
    }

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to submit cart');
    }

    return response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

export const GetSearchItems = async (query: string) => {
  const token = await AsyncStorage.getItem('user_session');
  const response = await fetch(`${BASE_URL}/vls2/shopping_views/search/`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ search_para: query }),
  });

  if (response.status === 401) {
    router.replace('/');
    return;
  }

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.message || 'Failed to fetch search results');
  }

  const data = await response.json();
  return { data }; // Match the structure of GetFilteredSectionDetails
};