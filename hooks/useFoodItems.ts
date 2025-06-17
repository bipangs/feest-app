import { useAuth } from '@/contexts/AuthContext';
import { FoodService } from '@/services/foodService';
import { FoodItem, FoodRequest } from '@/types/food';
import { useCallback, useEffect, useState } from 'react';

export const useFoodItems = () => {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFoodItems = useCallback(async (status?: string) => {
    try {
      setError(null);
      const items = await FoodService.getFoodItems(status);
      setFoodItems(items);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch food items');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFoodItems();
  }, [fetchFoodItems]);

  useEffect(() => {
    fetchFoodItems();
  }, [fetchFoodItems]);

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

  const fetchUserFoodItems = useCallback(async () => {
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
  }, [user]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserFoodItems();
  }, [fetchUserFoodItems]);

  useEffect(() => {
    fetchUserFoodItems();
  }, [fetchUserFoodItems]);

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

  const fetchRequests = useCallback(async () => {
    try {
      setError(null);
      const fetchedRequests = await FoodService.getFoodRequests(foodItemId);
      setRequests(fetchedRequests);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  }, [foodItemId]);

  useEffect(() => {
    if (foodItemId) {
      fetchRequests();
    }
  }, [fetchRequests, foodItemId]);

  return {
    requests,
    loading,
    error,
    refetch: fetchRequests,
  };
};
