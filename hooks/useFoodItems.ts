import { useAuth } from '@/contexts/AuthContext';
import { FoodService } from '@/services/foodService';
import { FoodItem, FoodRequest } from '@/types/food';
import { useEffect, useState } from 'react';

export const useFoodItems = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchFoodItems = async (status?: string) => {
    try {
      setError(null);
      const items = await FoodService.getFoodItemsWithLocation(status);
      setFoodItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch food items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      setError(null);
      const items = await FoodService.getFoodItemsWithLocation();
      setFoodItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch food items');
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    let mounted = true;
    
    const loadInitialData = async () => {
      try {
        setError(null);
        const items = await FoodService.getFoodItemsWithLocation();
        if (mounted) {
          setFoodItems(items);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch food items');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadInitialData();
    
    return () => {
      mounted = false;
    };
  }, []);

  return {
    foodItems,
    loading,
    refreshing,
    error,
    refresh,
    fetchFoodItems,
  };
};

export const useUserFoodItems = () => {
  const { user } = useAuth();
  const [userFoodItems, setUserFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserFoodItems = async () => {
    if (!user) return;
    
    try {
      setError(null);
      const items = await FoodService.getUserFoodItems(user.$id);
      setUserFoodItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch your food items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    try {
      setError(null);
      const items = await FoodService.getUserFoodItems(user.$id);
      setUserFoodItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch your food items');
    } finally {
      setRefreshing(false);
    }
  };
  useEffect(() => {
    let mounted = true;
    
    const loadUserData = async () => {
      if (!user) return;
      
      try {
        setError(null);
        const items = await FoodService.getUserFoodItems(user.$id);
        if (mounted) {
          setUserFoodItems(items);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch your food items');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    if (user) {
      loadUserData();
    }
    
    return () => {
      mounted = false;
    };
  }, [user?.$id]); // Use user.$id instead of the whole user object

  return {
    userFoodItems,
    loading,
    refreshing,
    error,
    refresh,
    fetchUserFoodItems,
  };
};

export const useFoodRequests = (foodItemId: string) => {
  const [requests, setRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setError(null);
      const fetchedRequests = await FoodService.getFoodRequests(foodItemId);
      setRequests(fetchedRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let mounted = true;
    
    const loadRequests = async () => {
      if (!foodItemId) return;
      
      try {
        setError(null);
        const fetchedRequests = await FoodService.getFoodRequests(foodItemId);
        if (mounted) {
          setRequests(fetchedRequests);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to fetch requests');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };
    
    loadRequests();
    
    return () => {
      mounted = false;
    };
  }, [foodItemId]);

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
  };
};
