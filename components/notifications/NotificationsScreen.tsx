import { FoodSwapRequestNotification } from '@/components/notifications';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { NotificationService } from '@/services/notificationService';
import { SimpleNotification } from '@/types/notification';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  View
} from 'react-native';

export function NotificationsScreen() {
  const [notifications, setNotifications] = useState<SimpleNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }
    
    try {
      const notificationsData = await NotificationService.getUserNotifications();
      setNotifications(notificationsData);
    } catch (error: any) {
      console.error('Error loading notifications:', error);
      Alert.alert('Error', `Failed to load notifications: ${error.message}`);
    } finally {
      if (showLoader) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleRespondToNotification = async (
    notificationId: string,
    response: 'accepted' | 'rejected'
  ) => {
    try {
      // Import FoodService to use the response method
      const { FoodService } = await import('@/services/foodService');
      const result = await FoodService.respondToFoodSwapNotification(
        notificationId,
        response
      );

      if (result.success) {
        Alert.alert('Success', result.message);
        loadData(); // Reload data
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error: any) {
      console.error('Error responding to notification:', error);
      Alert.alert('Error', error.message);
    }
  };

  const renderNotification = ({ item }: { item: SimpleNotification }) => (
    <FoodSwapRequestNotification
      key={item.$id}
      notification={item}
      onRespond={handleRespondToNotification}
    />
  );

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading notifications...</ThemedText>
      </ThemedView>
    );
  }

  const pendingRequests = notifications.filter(n => n.type === 'food_request' && !n.read);
  const otherNotifications = notifications.filter(n => n.type !== 'food_request' || n.read);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.header}>Notifications</ThemedText>
      
      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Pending Requests ({pendingRequests.length})
          </ThemedText>
          <FlatList
            data={pendingRequests}
            renderItem={renderNotification}
            keyExtractor={(item) => item.$id || Math.random().toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
      
      {otherNotifications.length > 0 && (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Other Notifications ({otherNotifications.length})
          </ThemedText>
          <FlatList
            data={otherNotifications}
            renderItem={renderNotification}
            keyExtractor={(item) => item.$id || Math.random().toString()}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {notifications.length === 0 && (
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>No notifications</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            You'll see food swap requests and updates here
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: Colors.light.tint,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    opacity: 0.6,
  },
  emptySubtext: {
    fontSize: 14,
    opacity: 0.5,
    textAlign: 'center',
  },
});
