import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

const BASE_URL = process.env.EXPO_PUBLIC_BackendServerURL;
console.log('Backend Server URL:', BASE_URL);

export const loginUser = async (email: string, password: string) => {
  try {
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
  } catch (error) {
    console.error('Login API call failed:', error);
    throw error;
  }
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
    // await AsyncStorage.removeItem("user_session"); // Remove session before redirecting
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
    // await AsyncStorage.removeItem("user_session"); // Remove session before redirecting
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
  try {
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
      // await AsyncStorage.removeItem("user_session"); // Remove session before redirecting
      router.replace('/');
      return;
    }

    if (!response.ok) {
      throw new Error('Failed to fetch filtered section details');
    }

    const data = await response.json();
    console.log('API Response:', data); // Log the API response
    return data;
  } catch (error) {
    console.error('Error fetching filtered section details:', error);
    throw error;
  }
};

export const GetSingleItems = async ({ id }: { id: string }) => {
  try {
    const token = await AsyncStorage.getItem('user_session');
    const response = await fetch(`${BASE_URL}/vls2/shopping_views/single_item_view/?id=${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    if (response.status === 401) {
      // await AsyncStorage.removeItem("user_session"); // Remove session before redirecting
      router.replace('/');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    console.log('API Response 11:', data); // Log the API response
    return data;
  } catch (error) {
    console.error('Error fetching single item:', error);
    throw error;
  }
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
    // await AsyncStorage.removeItem("user_session"); // Remove session before redirecting
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
      // await AsyncStorage.removeItem("user_session"); // Remove session before redirecting
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
  try {
    const token = await AsyncStorage.getItem('user_session');
    
    const response = await fetch(`${BASE_URL}/vls2/shopping_views/search/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ search_para: query }),
    });

    // Log the raw response status and headers
    console.log('Search API Response Status:', response.status);
    console.log('Search API Response Headers:', Object.fromEntries(response.headers.entries()));

    if (response.status === 401) {
      // await AsyncStorage.removeItem("user_session"); // Remove session before redirecting
      router.replace('/');
      return null;
    }

    const data = await response.json();
    console.log('Search API Response Data:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch search results');
    }

    return { data };
  } catch (error) {
    console.error('Search API Error:', error);
    throw error;
  }
};
export const GetAllOrders = async () => {
  try {
    const token = await AsyncStorage.getItem('user_session');
    const response = await fetch(`${BASE_URL}/vls2/shopping_views/all_order/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${token}`,
      },
    });

    if (response.status === 401) {
      // await AsyncStorage.removeItem("user_session"); // Remove session before redirecting
      router.replace('/');
      return;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    console.log('API Response all orders:', data); // Log the API response
    return data;
  } catch (error) {
    console.error('Error fetching single item:', error);
    throw error;
  }
};
// http://192.168.0.162:8000/vls2/shopping_views/all_order/
