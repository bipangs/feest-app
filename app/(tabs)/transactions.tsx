import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { EventHorizontalCard } from '@/components/events/EventHorizontalCard';
import { FoodHorizontalCard } from '@/components/food/FoodHorizontalCard';
import { HorizontalScrollSection } from '@/components/ui/HorizontalScrollSection';
import { Colors } from '@/constants/Colors';
import { useUserHistory } from '@/hooks/useUserHistory';
import { Event } from '@/types/event';
import { FoodItem } from '@/types/food';

export default function HistoryScreen() {
  const {
    foodListings,
    ongoingSwaps,
    completedSwaps,
    attendedEvents,
    statistics,
    loading,
    refreshing,
    refresh
  } = useUserHistory();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return Colors.light.tint;
      case 'requested':
        return '#FF9500'; // Orange
      case 'completed':
        return '#34C759'; // Green
      default:
        return Colors.light.tabIconDefault;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return 'checkmark-circle';
      case 'requested':
        return 'time';
      case 'completed':
        return 'checkmark-done-circle';
      default:
        return 'help-circle';
    }
  };

  const renderFoodItem = (item: FoodItem, index: number) => (
    <View style={styles.foodItemWrapper}>
      <FoodHorizontalCard 
        item={item} 
        onPress={() => console.log('Food item pressed:', item.title)}
      />
      <View style={styles.statusContainer}>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status) as any} 
            size={12} 
            color="white" 
          />
          <ThemedText style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </ThemedText>
        </View>
      </View>
    </View>
  );

  const renderSwapItem = (item: FoodItem & { swapWith: string; requestedDate?: Date; completedDate?: Date }, index: number) => (
    <View style={styles.swapItemWrapper}>
      <FoodHorizontalCard 
        item={item} 
        onPress={() => console.log('Swap item pressed:', item.title)}
      />
      <View style={styles.swapInfo}>
        <ThemedText style={styles.swapWithText}>
          Swapped with {item.swapWith}
        </ThemedText>
        <ThemedText style={styles.swapDateText}>
          {item.completedDate 
            ? `Completed ${item.completedDate.toLocaleDateString()}`
            : `Requested ${item.requestedDate?.toLocaleDateString()}`
          }
        </ThemedText>
      </View>
    </View>
  );

  const renderEventItem = (event: Event, index: number) => (
    <View style={styles.eventItemWrapper}>
      <EventHorizontalCard 
        item={event} 
        onPress={() => console.log('Event pressed:', event.title)}
      />
      <View style={styles.eventInfo}>
        <ThemedText style={styles.eventStatusText}>
          {event.status === 'completed' ? 'Attended' : 'Participating'}
        </ThemedText>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.content}          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={Colors.light.tint}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.titleContainer}>
            <ThemedText type="title">History</ThemedText>
            <ThemedText style={styles.subtitle}>
              Track your food listings, swaps, and event participation
            </ThemedText>
          </ThemedView>          {/* Your Food Listings */}
          <HorizontalScrollSection
            title="Your Food Listings"
            data={foodListings}
            renderItem={renderFoodItem}
            emptyMessage="No food listings yet"
          />

          {/* Ongoing Food Swaps */}
          <HorizontalScrollSection
            title="Ongoing Swaps"
            data={ongoingSwaps}
            renderItem={renderSwapItem}
            emptyMessage="No ongoing swaps"
          />

          {/* Completed Food Swaps */}
          <HorizontalScrollSection
            title="Completed Swaps"
            data={completedSwaps}
            renderItem={renderSwapItem}
            emptyMessage="No completed swaps yet"
          />

          {/* Event Attendance History */}
          <HorizontalScrollSection
            title="Event History"
            data={attendedEvents}
            renderItem={renderEventItem}
            emptyMessage="No events attended yet"
          />

          {/* Statistics Section */}
          <ThemedView style={styles.statsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Statistics</ThemedText>
            <View style={styles.statsGrid}>              <View style={styles.statCard}>
                <ThemedText style={styles.statNumber}>{statistics.totalFoodShared}</ThemedText>
                <ThemedText style={styles.statLabel}>Food Items Shared</ThemedText>
              </View>
              <View style={styles.statCard}>
                <ThemedText style={styles.statNumber}>{statistics.successfulSwaps}</ThemedText>
                <ThemedText style={styles.statLabel}>Successful Swaps</ThemedText>
              </View>
              <View style={styles.statCard}>
                <ThemedText style={styles.statNumber}>{statistics.eventsAttended}</ThemedText>
                <ThemedText style={styles.statLabel}>Events Attended</ThemedText>
              </View>
              <View style={styles.statCard}>
                <ThemedText style={styles.statNumber}>{statistics.activeListings}</ThemedText>
                <ThemedText style={styles.statLabel}>Active Listings</ThemedText>
              </View>
            </View>
          </ThemedView>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  titleContainer: {
    marginBottom: 24,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    marginTop: 4,
  },
  foodItemWrapper: {
    marginRight: 16,
    width: 280,
  },
  statusContainer: {
    marginTop: 8,
    alignItems: 'flex-start',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  swapItemWrapper: {
    marginRight: 16,
    width: 280,
  },
  swapInfo: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  swapWithText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  swapDateText: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  eventItemWrapper: {
    marginRight: 16,
    width: 280,
  },
  eventInfo: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  eventStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  statsSection: {
    marginTop: 32,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.tint,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    marginTop: 4,
  },
});
