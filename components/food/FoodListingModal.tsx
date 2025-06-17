import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Dimensions,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { FoodItemCard } from '@/components/food/FoodItemCard';
import { FoodMap } from '@/components/food/FoodMap';
import { Colors } from '@/constants/Colors';
import { useFoodItems } from '@/hooks/useFoodItems';
import { FoodItem } from '@/types/food';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'available' | 'nearby';
type ViewType = 'list' | 'map';

interface FoodListingModalProps {
  visible: boolean;
  onClose: () => void;
}

export function FoodListingModal({ visible, onClose }: FoodListingModalProps) {
  const { foodItems, loading, refreshing, error, refresh } = useFoodItems();
  const [filter, setFilter] = useState<FilterType>('all');
  const [viewType, setViewType] = useState<ViewType>('list');
  const [selectedFoodId, setSelectedFoodId] = useState<string | undefined>();

  const getFilteredItems = (): FoodItem[] => {
    switch (filter) {
      case 'available':
        return foodItems.filter(item => item.status === 'available');
      case 'nearby':
        // For now, just show available items. In a real app, you'd filter by location
        return foodItems.filter(item => 
          item.status === 'available' && item.latitude && item.longitude
        );
      default:
        return foodItems;
    }
  };

  const handleRefresh = () => {
    refresh();
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
      <ThemedText
        style={[
          styles.filterButtonText,
          filter === type && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderFoodItem = ({ item }: { item: FoodItem }) => (
    <FoodItemCard 
      item={item} 
      onRefresh={handleRefresh}
      onPress={() => {
        setSelectedFoodId(item.$id);
        console.log('Food item pressed:', item.title);
      }}
    />
  );

  const handleMapMarkerPress = (item: FoodItem) => {
    setSelectedFoodId(item.$id);
    console.log('Map marker pressed:', item.title);
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant" size={80} color={Colors.light.tabIconDefault} />
      <ThemedText style={styles.emptyTitle}>No Food Items</ThemedText>
      <ThemedText style={styles.emptyText}>
        {filter === 'available' 
          ? 'No available food items at the moment.'
          : filter === 'nearby'
          ? 'No nearby food items found.'
          : 'No food items available right now.'}
      </ThemedText>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <ThemedText style={styles.headerTitle}>Food Share</ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Share food, reduce waste
            </ThemedText>
          </View>
          
          <View style={styles.headerRight}>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={[styles.viewToggle, viewType === 'list' && styles.viewToggleActive]}
                onPress={() => setViewType('list')}
              >
                <Ionicons 
                  name="list" 
                  size={20} 
                  color={viewType === 'list' ? 'white' : Colors.light.tabIconDefault} 
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.viewToggle, viewType === 'map' && styles.viewToggleActive]}
                onPress={() => setViewType('map')}
              >
                <Ionicons 
                  name="map" 
                  size={20} 
                  color={viewType === 'map' ? 'white' : Colors.light.tabIconDefault} 
                />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filterContainer}>
          {renderFilterButton('all', 'All', 'grid')}
          {renderFilterButton('available', 'Available', 'checkmark-circle')}
          {renderFilterButton('nearby', 'Nearby', 'location')}
        </View>

        {/* Content */}
        {viewType === 'list' ? (
          <FlatList
            data={getFilteredItems()}
            renderItem={renderFoodItem}
            keyExtractor={(item) => item.$id!}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={handleRefresh}
                tintColor={Colors.light.tint}
              />
            }
            ListEmptyComponent={renderEmpty}
          />
        ) : (
          <FoodMap
            foodItems={getFilteredItems()}
            selectedFoodId={selectedFoodId}
            onMarkerPress={handleMapMarkerPress}
            style={styles.mapContainer}
          />
        )}
      </SafeAreaView>
    </Modal>
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  viewToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  viewToggleActive: {
    backgroundColor: Colors.light.tint,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
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
  },
  mapContainer: {
    flex: 1,
  },
});
