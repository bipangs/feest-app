import { useAuth } from '@/contexts/AuthContext';
import { Event } from '@/types/event';
import { FoodItem } from '@/types/food';
import { useEffect, useState } from 'react';
import { useEvents } from './useEvents';
import { useUserFoodItems } from './useFoodItems';

export interface UserHistoryData {
  foodListings: FoodItem[];
  ongoingSwaps: (FoodItem & { swapWith: string; requestedDate: Date })[];
  completedSwaps: (FoodItem & { swapWith: string; completedDate: Date })[];
  attendedEvents: Event[];
  statistics: {
    totalFoodShared: number;
    successfulSwaps: number;
    eventsAttended: number;
    activeListings: number;
  };
}

// Mock data for swaps - in a real app, this would come from your backend
const mockSwapsData = {
  ongoing: [
    {
      $id: 'swap1',
      title: 'Fresh Apples',
      description: 'Red delicious apples from my garden',
      imageUri: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400',
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      status: 'requested' as const,
      ownerId: 'user1',
      ownerName: 'You',
      locationIP: '192.168.1.1',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      swapWith: 'Sarah Johnson',
      requestedDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    },
  ],
  completed: [
    {
      $id: 'swap2',
      title: 'Homemade Bread',
      description: 'Fresh sourdough bread',
      imageUri: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400',
      expiryDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'completed' as const,
      ownerId: 'user1',
      ownerName: 'You',
      locationIP: '192.168.1.1',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      swapWith: 'Mike Chen',
      completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      $id: 'swap3',
      title: 'Garden Vegetables',
      description: 'Fresh tomatoes and cucumbers',
      imageUri: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400',
      expiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'completed' as const,
      ownerId: 'user1',
      ownerName: 'You',
      locationIP: '192.168.1.1',
      createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      swapWith: 'Emma Davis',
      completedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  ],
};

export const useUserHistory = () => {
  const { user } = useAuth();
  const { userFoodItems, loading: foodLoading, refreshing: foodRefreshing, refresh: refreshFood } = useUserFoodItems();
  const { events, loading: eventsLoading, refreshing: eventsRefreshing, refresh: refreshEvents } = useEvents();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserHistory = (): UserHistoryData => {
    // Filter events where user participated
    const attendedEvents = events.filter(event => 
      event.participantIds.includes(user?.$id || '') && 
      (event.status === 'completed' || event.status === 'ongoing')
    );

    const statistics = {
      totalFoodShared: userFoodItems.length,
      successfulSwaps: mockSwapsData.completed.length,
      eventsAttended: attendedEvents.length,
      activeListings: userFoodItems.filter(item => item.status === 'available').length,
    };

    return {
      foodListings: userFoodItems,
      ongoingSwaps: mockSwapsData.ongoing,
      completedSwaps: mockSwapsData.completed,
      attendedEvents,
      statistics,
    };
  };

  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshFood(),
        refreshEvents()
      ]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh history');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(foodLoading || eventsLoading);
  }, [foodLoading, eventsLoading]);

  return {
    ...getUserHistory(),
    loading,
    refreshing: refreshing || foodRefreshing || eventsRefreshing,
    error,
    refresh,
  };
};
