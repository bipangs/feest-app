import { EventHorizontalCard } from '@/components/events/EventHorizontalCard';
import { AddFoodForm } from '@/components/food/AddFoodForm';
import { FoodHorizontalCard } from '@/components/food/FoodHorizontalCard';
import { FoodListingModal } from '@/components/food/FoodListingModal';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HorizontalScrollSection } from '@/components/ui/HorizontalScrollSection';
import { Colors, CustomColors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { useFoodItems } from '@/hooks/useFoodItems';
import { LocationService } from '@/services/locationService';
import { Event } from '@/types/event';
import { FoodItem } from '@/types/food';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LocationState {
  latitude: number;
  longitude: number;
  address: string;
}

export default function HomeScreen() {
  const { user, userProfile } = useAuth();
  const { foodItems, loading: foodLoading, refreshing: foodRefreshing, refresh: refreshFood } = useFoodItems();
  const { upcomingEvents, loading: eventsLoading, refreshing: eventsRefreshing, refresh: refreshEvents } = useEvents();
  
  const [userLocation, setUserLocation] = useState<LocationState | null>(null);
  const [nearestFoodItems, setNearestFoodItems] = useState<(FoodItem & { distance: number })[]>([]);  const [nearestEvents, setNearestEvents] = useState<(Event & { distance: number })[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showFoodModal, setShowFoodModal] = useState(false);

  useEffect(() => {
    getUserLocation();
  }, []);
  useEffect(() => {
    if (userLocation && foodItems.length > 0) {
      // Food items now have resolved coordinates from IP addresses
      const itemsWithCoords = foodItems.filter(item => 
        item.latitude && item.longitude && item.status === 'available'
      );
      
      const nearest = LocationService.getNearestItems(
        itemsWithCoords,
        userLocation,
        20 // 20km radius
      );
      setNearestFoodItems(nearest.slice(0, 10)); // Show top 10
    }
  }, [userLocation, foodItems]);

  useEffect(() => {
    if (userLocation && upcomingEvents.length > 0) {
      const nearest = LocationService.getNearestItems(
        upcomingEvents,
        userLocation,
        30 // 30km radius for events
      );
      setNearestEvents(nearest.slice(0, 10)); // Show top 10
    }
  }, [userLocation, upcomingEvents]);

  const getUserLocation = async () => {
    try {
      const location = await LocationService.getDeviceLocation();
      if (location) {
        setUserLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          address: location.address
        });
      } else {
        // Fallback to IP location
        const ipLocation = await LocationService.getLocationFromIP();
        if (ipLocation) {
          setUserLocation({
            latitude: ipLocation.latitude,
            longitude: ipLocation.longitude,
            address: ipLocation.address
          });
        }
      }
    } catch (error) {
      console.error('Error getting user location:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      refreshFood(),
      refreshEvents(),
      getUserLocation()
    ]);
    setRefreshing(false);  };  const handleFoodItemPress = (item: FoodItem) => {
    // Open the food listing modal
    setShowFoodModal(true);
  };

  const handleEventPress = (event: Event) => {
    // Navigate to event details
    router.push('/(tabs)/events');
  };
  const handleSeeAllFood = () => {
    // Open the food listing modal
    setShowFoodModal(true);
  };
  const handleSeeAllEvents = () => {
    router.push('/(tabs)/events');
  };

  const handleAddFood = () => {
    setShowAddForm(false);
    refreshFood();
  };

  const handleShareFood = () => {
    setShowAddForm(true);
  };
  const renderFoodItem = (item: FoodItem & { distance?: number }, index: number) => (
    <View style={styles.cardWrapper}>
      <FoodHorizontalCard 
        item={item} 
        onPress={handleFoodItemPress}
      />
      {item.distance !== undefined && (
        <View style={styles.distanceInfo}>
          <Ionicons name="location-outline" size={12} color={Colors.light.icon} />
          <ThemedText style={styles.distanceText}>
            {LocationService.formatDistance(item.distance)} away
          </ThemedText>
        </View>
      )}
    </View>
  );

  const renderEventItem = (item: Event & { distance?: number }, index: number) => (
    <View style={styles.cardWrapper}>
      <EventHorizontalCard 
        item={item} 
        onPress={handleEventPress}
      />
      {item.distance !== undefined && (
        <View style={styles.distanceInfo}>
          <Ionicons name="location-outline" size={12} color={Colors.light.icon} />
          <ThemedText style={styles.distanceText}>
            {LocationService.formatDistance(item.distance)} away
          </ThemedText>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.light.tint}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <View style={styles.welcomeSection}>
            <ThemedText type="title" style={styles.welcomeText}>
              Welcome{user ? `, ${userProfile?.name || 'back'}` : ''}!
            </ThemedText>            {userLocation && (
              <View style={styles.locationInfo}>
                <Ionicons name="location-outline" size={16} color={Colors.light.icon} />
                <ThemedText style={styles.locationText} numberOfLines={1}>
                  {userLocation.address}
                </ThemedText>
              </View>
            )}
          </View>
        </ThemedView>

        {/* Nearest Food Section */}
        <HorizontalScrollSection
          title="Nearest Food"
          data={nearestFoodItems}
          renderItem={renderFoodItem}
          onSeeAll={handleSeeAllFood}
          emptyMessage={userLocation ? "No food items nearby" : "Location needed to show nearby food"}
        />

        {/* Upcoming Events Section */}
        <HorizontalScrollSection
          title="Upcoming Events"
          data={nearestEvents}
          renderItem={renderEventItem}
          onSeeAll={handleSeeAllEvents}
          emptyMessage={userLocation ? "No events nearby" : "Location needed to show nearby events"}
        />

        {/* Quick Actions */}
        <ThemedView style={styles.quickActions}>
          <ThemedText type="subtitle" style={styles.quickActionsTitle}>
            Quick Actions
          </ThemedText>          <View style={styles.actionButtons}>            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShareFood}
            >
              <Ionicons name="add-circle-outline" size={24} color={Colors.light.tint} />
              <ThemedText style={styles.actionButtonText}>Share Food</ThemedText>
            </TouchableOpacity>            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => router.push('/(tabs)/events')}
            >
              <Ionicons name="calendar-outline" size={24} color={Colors.light.tint} />
              <ThemedText style={styles.actionButtonText}>Create Event</ThemedText>
            </TouchableOpacity>
          </View>
        </ThemedView>        <View style={styles.bottomSpacing} />
      </ScrollView>

      <Modal
        visible={showAddForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >        <AddFoodForm
          onFoodAdded={handleAddFood}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>

      <FoodListingModal
        visible={showFoodModal}
        onClose={() => setShowFoodModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.white,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  welcomeSection: {
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },  locationText: {
    fontSize: 14,
    color: Colors.light.icon,
    marginLeft: 4,
    flex: 1,
  },
  cardWrapper: {
    position: 'relative',
  },
  distanceInfo: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 2,
    fontWeight: '500',
  },
  quickActions: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 8,
  },
  quickActionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },  actionButton: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 8,
  },
  actionButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 20,
  },
});
