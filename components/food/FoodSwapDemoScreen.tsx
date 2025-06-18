import { FoodSwapRequestButton } from '@/components/food';
import { NotificationsScreen } from '@/components/notifications';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { FoodService } from '@/services/foodService';
import { FoodItem, FoodRequest } from '@/types/food';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    View
} from 'react-native';

export function FoodSwapDemoScreen() {
  const [availableFoods, setAvailableFoods] = useState<FoodItem[]>([]);
  const [userRequests, setUserRequests] = useState<FoodRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    
    try {
      // Load available food items
      const foods = await FoodService.getFoodItems('available');
      setAvailableFoods(foods);

      // Load user's sent requests
      const requests = await FoodService.getUserSentRequests();
      setUserRequests(requests);
    } catch (error: any) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load food data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData(false);
  };

  const handleRequestSent = () => {
    // Refresh data after a request is sent
    loadData(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderFoodItem = (food: FoodItem) => {
    const userRequest = userRequests.find(req => req.foodItemId === food.$id);
    const hasRequested = userRequest && userRequest.status === 'pending';
    
    return (
      <ThemedView key={food.$id} style={styles.foodCard}>
        <View style={styles.foodHeader}>
          <ThemedText style={styles.foodTitle}>{food.title}</ThemedText>
          <ThemedText style={styles.foodOwner}>by {food.ownerName}</ThemedText>
        </View>
        
        <ThemedText style={styles.foodDescription}>
          {food.description}
        </ThemedText>
        
        <View style={styles.foodMeta}>
          <ThemedText style={styles.foodExpiry}>
            Expires: {food.expiryDate.toLocaleDateString()}
          </ThemedText>
          <ThemedText style={styles.foodStatus}>
            Status: {food.status}
          </ThemedText>
        </View>

        {hasRequested ? (
          <View style={styles.requestedContainer}>
            <ThemedText style={styles.requestedText}>
              ✓ Request sent - {userRequest.status}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.actionContainer}>
            <FoodSwapRequestButton
              foodItem={food}
              onRequestSent={handleRequestSent}
            />
          </View>
        )}
      </ThemedView>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[Colors.light.tint]}
        />
      }
    >
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          Food Swap System Demo
        </ThemedText>
        <ThemedText style={styles.sectionDescription}>
          This demonstrates the new food swap request system where:
          {'\n'}• Users can request to swap food items
          {'\n'}• Owners receive notifications to accept/reject
          {'\n'}• Chat rooms are created automatically when accepted
          {'\n'}• Food status updates to "requested" when accepted
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          Available Food Items
        </ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          Tap "Request Swap" to send a swap request to the owner
        </ThemedText>
        
        {availableFoods.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No available food items at the moment
            </ThemedText>
          </ThemedView>
        ) : (
          availableFoods.map(renderFoodItem)
        )}
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          Food Owner Notifications
        </ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          This is where food owners see and respond to swap requests
        </ThemedText>
        
        <View style={styles.notificationsContainer}>
          <NotificationsScreen />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>
          How It Works
        </ThemedText>
        <View style={styles.stepContainer}>
          <ThemedText style={styles.stepText}>
            1. <ThemedText style={styles.stepBold}>Request:</ThemedText> User taps "Request Swap" on available food
          </ThemedText>
          <ThemedText style={styles.stepText}>
            2. <ThemedText style={styles.stepBold}>Notification:</ThemedText> Owner receives request notification
          </ThemedText>
          <ThemedText style={styles.stepText}>
            3. <ThemedText style={styles.stepBold}>Decision:</ThemedText> Owner accepts or rejects the request
          </ThemedText>
          <ThemedText style={styles.stepText}>
            4a. <ThemedText style={styles.stepBold}>If Accepted:</ThemedText> Chat room created, food status → "requested"
          </ThemedText>
          <ThemedText style={styles.stepText}>
            4b. <ThemedText style={styles.stepBold}>If Rejected:</ThemedText> No chat room, food stays "available"
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    margin: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
    backgroundColor: '#e8f4fd',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tint,
  },
  foodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foodHeader: {
    marginBottom: 8,
  },
  foodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  foodOwner: {
    fontSize: 14,
    opacity: 0.7,
  },
  foodDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  foodMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  foodExpiry: {
    fontSize: 12,
    opacity: 0.7,
  },
  foodStatus: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  actionContainer: {
    alignItems: 'flex-end',
  },
  requestedContainer: {
    backgroundColor: '#d4edda',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  requestedText: {
    color: '#155724',
    fontSize: 14,
    fontWeight: '600',
  },
  notificationsContainer: {
    height: 300,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  emptyContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  stepContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 8,
  },
  stepBold: {
    fontWeight: 'bold',
    color: Colors.light.tint,
  },
});
