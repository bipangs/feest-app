import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { FoodService } from '@/services/foodService';
import { TransactionService } from '@/services/transactionService';
import { FoodItem } from '@/types/food';
import { Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { FoodRequestModal } from './FoodRequestModal';
import { TransactionPage } from './TransactionPage';

export const TransactionDemo: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FoodItem | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'transactions' | 'available'>('transactions');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userTransactions, availableFoodItems] = await Promise.all([
        TransactionService.getUserTransactions(),
        FoodService.getFoodItems('available'),
      ]);
      
      setTransactions(userTransactions);
      setFoodItems(availableFoodItems.filter(item => item.ownerId !== user?.$id)); // Exclude own items
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleTransactionPress = (transactionId: string) => {
    setSelectedTransaction(transactionId);
  };

  const handleFoodItemPress = (foodItem: FoodItem) => {
    setSelectedFoodItem(foodItem);
    setShowRequestModal(true);
  };

  const handleRequestSuccess = () => {
    loadData(); // Refresh data after successful request
    setActiveTab('transactions'); // Switch to transactions tab
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: Transaction['status']) => {
    switch (status) {
      case 'pending': return '#FF9500';
      case 'accepted': return '#007AFF';
      case 'completed': return '#34C759';
      case 'cancelled': return '#FF3B30';
      default: return '#8E8E93';
    }
  };

  const getStatusText = (status: Transaction['status']) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'accepted': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const getCategoryEmoji = (category?: string) => {
    switch (category) {
      case 'fruits': return '🍎';
      case 'vegetables': return '🥕';
      case 'grains': return '🌾';
      case 'dairy': return '🥛';
      case 'meat': return '🥩';
      case 'baked-goods': return '🍞';
      case 'prepared-meals': return '🍽️';
      case 'beverages': return '🥤';
      default: return '📦';
    }
  };

  if (selectedTransaction) {
    return (
      <TransactionPage
        transactionId={selectedTransaction}
        onBack={() => setSelectedTransaction(null)}
      />
    );
  }

  const renderTransaction = (transaction: Transaction) => {
    const isOwner = user?.$id === transaction.ownerId;
    const otherUserName = isOwner ? transaction.requesterName : transaction.ownerName;
    const roleText = isOwner ? 'Owner' : 'Requester';

    return (
      <TouchableOpacity
        key={transaction.$id}
        style={styles.transactionCard}
        onPress={() => handleTransactionPress(transaction.$id!)}
      >
        <View style={styles.transactionHeader}>
          <Text style={styles.foodTitle}>{transaction.foodTitle}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
            <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
          </View>
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionRole}>{roleText}</Text>
          <Text style={styles.transactionUser}>with {otherUserName}</Text>
          <Text style={styles.transactionDate}>{formatDate(transaction.requestedDate)}</Text>
        </View>

        <View style={styles.transactionFooter}>
          <Ionicons name="chatbubbles" size={16} color={Colors.light.tint} />
          <Text style={styles.transactionAction}>Tap to open chat</Text>
          <Ionicons name="chevron-forward" size={16} color="#999" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderFoodItem = (item: FoodItem) => {
    return (
      <TouchableOpacity
        key={item.$id}
        style={styles.foodItemCard}
        onPress={() => handleFoodItemPress(item)}
      >
        <View style={styles.foodItemHeader}>
          <Text style={styles.categoryEmoji}>{getCategoryEmoji(item.category)}</Text>
          <View style={styles.foodItemTitleContainer}>
            <Text style={styles.foodItemTitle}>{item.title}</Text>
            <Text style={styles.foodItemOwner}>by {item.ownerName}</Text>
          </View>
        </View>
        
        <Text style={styles.foodItemDescription} numberOfLines={2}>
          {item.description}
        </Text>

        <View style={styles.foodItemFooter}>
          <Text style={styles.expiryDate}>
            Expires {formatDate(item.expiryDate)}
          </Text>
          <View style={styles.requestButton}>
            <Ionicons name="send" size={14} color={Colors.light.tint} />
            <Text style={styles.requestButtonText}>Request</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Food Transactions</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={Colors.light.tint} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
            My Transactions ({transactions.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'available' && styles.activeTab]}
          onPress={() => setActiveTab('available')}
        >
          <Text style={[styles.tabText, activeTab === 'available' && styles.activeTabText]}>
            Available Food ({foodItems.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text>Loading...</Text>
          </View>
        ) : activeTab === 'transactions' ? (
          <View style={styles.listContainer}>
            {transactions.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="swap-horizontal" size={48} color="#999" />
                <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
                <Text style={styles.emptyStateMessage}>
                  Request food items to start your first transaction
                </Text>
              </View>
            ) : (
              transactions.map(renderTransaction)
            )}
          </View>
        ) : (
          <View style={styles.listContainer}>
            {foodItems.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="restaurant" size={48} color="#999" />
                <Text style={styles.emptyStateTitle}>No Available Food</Text>
                <Text style={styles.emptyStateMessage}>
                  Check back later for more food items
                </Text>
              </View>
            ) : (
              foodItems.map(renderFoodItem)
            )}
          </View>
        )}
      </ScrollView>

      {/* Request Modal */}
      <FoodRequestModal
        visible={showRequestModal}
        foodItem={selectedFoodItem}
        onClose={() => {
          setShowRequestModal(false);
          setSelectedFoodItem(null);
        }}
        onSuccess={handleRequestSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: Colors.light.tint,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  transactionCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  transactionDetails: {
    marginBottom: 12,
  },
  transactionRole: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
  },
  transactionUser: {
    fontSize: 16,
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  transactionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  transactionAction: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.tint,
  },
  foodItemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foodItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 12,
  },
  categoryEmoji: {
    fontSize: 32,
  },
  foodItemTitleContainer: {
    flex: 1,
  },
  foodItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  foodItemOwner: {
    fontSize: 14,
    color: '#666',
  },
  foodItemDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
    marginBottom: 12,
  },
  foodItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expiryDate: {
    fontSize: 14,
    color: '#FF9500',
  },
  requestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  requestButtonText: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '600',
  },
});
