import { AddFoodForm } from '@/components/food/AddFoodForm';
import { FoodItemCard } from '@/components/food/FoodItemCard';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useFoodItems, useUserFoodItems } from '@/hooks/useFoodItems';
import { FoodItem } from '@/types/food';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    FlatList,
    Modal,
    RefreshControl,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type FilterType = 'all' | 'available' | 'my-items';

export default function FoodScreen() {
  const { user } = useAuth();
  const { foodItems, loading, refreshing, error, refresh } = useFoodItems();
  const { userFoodItems, refresh: refreshUserItems } = useUserFoodItems();
  const [showAddForm, setShowAddForm] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

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

  const handleAddFood = () => {
    setShowAddForm(false);
    refresh();
    refreshUserItems();
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
    <FoodItemCard item={item} onRefresh={handleRefresh} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="restaurant" size={80} color={Colors.light.tabIconDefault} />
      <Text style={styles.emptyTitle}>No Food Items</Text>
      <Text style={styles.emptyText}>
        {filter === 'available' 
          ? 'No available food items at the moment.'
          : 'Be the first to share food with your community!'}
      </Text>
      <TouchableOpacity
        style={styles.addFirstButton}
        onPress={() => setShowAddForm(true)}
      >
        <Text style={styles.addFirstButtonText}>Add Food Item</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Food Share</Text>
          <Text style={styles.headerSubtitle}>Share food, reduce waste</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddForm(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton('all', 'All', 'grid')}
        {renderFilterButton('available', 'Available', 'checkmark-circle')}
        {renderFilterButton('my-items', 'My Items', 'person')}
      </View>

      <FlatList
        data={getFilteredItems()}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.$id!}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListEmptyComponent={renderEmpty}
      />

      <Modal
        visible={showAddForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <AddFoodForm
          onFoodAdded={handleAddFood}
          onCancel={() => setShowAddForm(false)}
        />
      </Modal>
    </SafeAreaView>
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
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: Colors.light.tint,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
  addFirstButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
