import { FoodItemCard } from '@/components/food/FoodItemCard';
import { FoodMap } from '@/components/food/FoodMap';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useFoodItems, useUserFoodItems } from '@/hooks/useFoodItems';
import { FoodItem } from '@/types/food';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type FilterType = 'all' | 'available' | 'my-items';
type ViewType = 'list' | 'map';

export default function FoodScreen() {
  const { user, userProfile } = useAuth();
  const { foodItems, loading, refreshing, error, refresh } = useFoodItems();
  const { userFoodItems, refresh: refreshUserItems } = useUserFoodItems();
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [selectedFoodId, setSelectedFoodId] = useState<string | undefined>();

  const getFilteredItems = (): FoodItem[] => {
    switch (filter) {
      case 'available':
        return foodItems.filter(item => item.status === 'available');
      case 'my-items':
        return userFoodItems;
      default:
        return foodItems;
    }
  };
  const handleRefresh = () => {
    refresh();
    if (filter === 'my-items') {
      refreshUserItems();
    }
  };

  const renderFilterButton = (type: FilterType, label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === type && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(type)}
    >
      <Ionicons 
        name={icon as any} 
        size={16} 
        color={filter === type ? 'white' : Colors.light.tabIconDefault} 
      />
      <Text
        style={[
          styles.filterButtonText,
          filter === type && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
    const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <FoodItemCard 
      item={item} 
      onRefresh={handleRefresh}
      onPress={() => {
        setSelectedFoodId(item.$id);
        // TODO: Navigate to food item details or handle card press
        console.log('Food item pressed:', item.title);
      }}
    />
  );

  const handleMapMarkerPress = (item: FoodItem) => {
    setSelectedFoodId(item.$id);
    // TODO: Show item details or handle marker press
    console.log('Map marker pressed:', item.title);
  };
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant" size={80} color={Colors.light.tabIconDefault} />
      <Text style={styles.emptyTitle}>No Food Items</Text>
      <Text style={styles.emptyText}>
        {filter === 'available' 
          ? 'No available food items at the moment.'
          : 'Be the first to share food with your community!'}
      </Text>      <TouchableOpacity
        style={styles.addFirstButton}
        onPress={() => router.navigate('/(tabs)')}
      >
        <Text style={styles.addFirstButtonText}>Go to Home to Add Food</Text>
      </TouchableOpacity>
    </View>
  );  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Food Share</Text>
          <Text style={styles.headerSubtitle}>Share food, reduce waste</Text>
        </View>        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.viewToggle, viewType === 'list' && styles.viewToggleActive]}
            onPress={() => setViewType('list')}
          >
            <Ionicons name="list" size={20} color={viewType === 'list' ? 'white' : Colors.light.tabIconDefault} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewToggle, viewType === 'map' && styles.viewToggleActive]}
            onPress={() => setViewType('map')}
          >
            <Ionicons name="map" size={20} color={viewType === 'map' ? 'white' : Colors.light.tabIconDefault} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All', 'grid')}
        {renderFilterButton('available', 'Available', 'checkmark-circle')}
        {renderFilterButton('my-items', 'My Items', 'person')}
      </View>

      {viewType === 'list' ? (
        <FlatList
          data={getFilteredItems()}
          renderItem={renderFoodItem}
          keyExtractor={(item) => item.$id!}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={renderEmpty}
        />
      ) : (
        <FoodMap
          foodItems={getFilteredItems()}          selectedFoodId={selectedFoodId}
          onMarkerPress={handleMapMarkerPress}
          style={styles.mapContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },  viewToggleActive: {
    backgroundColor: Colors.light.tint,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 12,
  },
  filterButtonActive: {
    backgroundColor: Colors.light.tint,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.tabIconDefault,
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
  },
});
