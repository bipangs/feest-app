import { NotificationsScreen } from '@/components/notifications';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { NotificationService } from '@/services/notificationService';
import { TransactionService } from '@/services/transactionService';
import { SimpleNotification } from '@/types/notification';
import { Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

interface TransactionNotificationsProps {
  onTransactionSelect?: (transactionId: string) => void;
}

export const TransactionNotifications: React.FC<TransactionNotificationsProps> = ({
  onTransactionSelect
}) => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<Transaction[]>([]);
  const [pendingNotifications, setPendingNotifications] = useState<SimpleNotification[]>([]);
  const [acceptedTransactions, setAcceptedTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'notifications' | 'transactions'>('notifications');useEffect(() => {
    loadTransactionNotifications();
  }, [activeTab]);

  useEffect(() => {
    loadTransactionNotifications();
  }, []);  const loadTransactionNotifications = async () => {
    try {
      if (!user) {
        console.log('⚠️ No user found, skipping transaction load');
        return;
      }

      console.log('📊 Loading transaction notifications for user:', user.$id);
      setLoading(true);
      
      // Load both notifications and transactions
      const [notifications, userTransactions] = await Promise.all([
        NotificationService.getUserNotifications(),
        TransactionService.getUserTransactions()
      ]);
      
      console.log('� Total notifications:', notifications.length);
      console.log('�📋 All user transactions:', userTransactions.length);
      
      // Filter pending notifications where current user is the recipient (food owner)
      const pendingNotifs = notifications.filter(
        n => n.type === 'food_request' && !n.read
      );
      console.log('⏳ Pending notification requests (as owner):', pendingNotifs.length);
      
      // Filter pending requests where current user is the owner (these are transactions)
      const pending = userTransactions.filter(
        t => t.ownerId === user.$id && t.status === 'pending'
      );
      console.log('⏳ Pending transaction requests (as owner):', pending.length);
      
      // Filter accepted transactions where current user is involved
      const accepted = userTransactions.filter(
        t => (t.ownerId === user.$id || t.requesterId === user.$id) && 
            t.status === 'accepted'
      );
      console.log('✅ Accepted transactions:', accepted.length);

      setPendingNotifications(pendingNotifs);
      setPendingRequests(pending);
      setAcceptedTransactions(accepted);
    } catch (error: any) {
      console.error('❌ Error loading transaction notifications:', error);
      Alert.alert('Error', `Failed to load transactions: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransactionNotifications();
    setRefreshing(false);
  };

  const handleAcceptNotification = async (notification: SimpleNotification) => {
    Alert.alert(
      'Accept Request',
      `Accept food swap request for your food item?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              const { FoodService } = await import('@/services/foodService');
              const result = await FoodService.respondToFoodSwapNotification(
                notification.$id!,
                'accepted'
              );
              
              if (result.success) {
                Alert.alert(
                  'Request Accepted!',
                  'A chat room has been created for you to coordinate the swap.',
                  [{ text: 'OK' }]
                );
                
                await loadTransactionNotifications();
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error: any) {
              Alert.alert('Error', `Failed to accept request: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handleRejectNotification = async (notification: SimpleNotification) => {
    Alert.alert(
      'Reject Request',
      `Reject food swap request for your food item?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              const { FoodService } = await import('@/services/foodService');
              const result = await FoodService.respondToFoodSwapNotification(
                notification.$id!,
                'rejected'
              );
              
              if (result.success) {
                Alert.alert('Request Rejected', 'The request has been rejected and the food item is available again.');
                await loadTransactionNotifications();
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error: any) {
              Alert.alert('Error', `Failed to reject request: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handleAcceptRequest = async (transaction: Transaction) => {
    Alert.alert(
      'Accept Request',
      `Accept food swap request from ${transaction.requesterName} for "${transaction.foodTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              const result = await TransactionService.acceptTransaction(transaction.$id!);
              
              Alert.alert(
                'Request Accepted!',
                'A chat room has been created for you to coordinate the swap.',
                [
                  {
                    text: 'Open Chat',
                    onPress: () => onTransactionSelect?.(transaction.$id!)
                  },
                  { text: 'OK' }
                ]              );
              
              await loadTransactionNotifications();
            } catch (error: any) {
              Alert.alert('Error', `Failed to accept request: ${error.message}`);
            }
          }
        }
      ]
    );
  };

  const handleRejectRequest = async (transaction: Transaction) => {
    Alert.alert(
      'Reject Request',
      `Reject food swap request from ${transaction.requesterName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await TransactionService.rejectTransaction(transaction.$id!);              Alert.alert('Request Rejected', 'The request has been rejected and the food item is available again.');
              await loadTransactionNotifications();
            } catch (error: any) {
              Alert.alert('Error', `Failed to reject request: ${error.message}`);
            }
          }
        }
      ]
    );
  };
  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNotificationDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </View>
    );
  }

  // Debug log current state
  console.log('🔍 Current state:', {
    activeTab,
    pendingNotifications: pendingNotifications.length,
    pendingRequests: pendingRequests.length,
    acceptedTransactions: acceptedTransactions.length
  });
  return (
    <View style={styles.container}>
      {/* Tab Header */}
      <View style={styles.tabHeader}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={() => setActiveTab('notifications')}
        >
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
            Food Requests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'transactions' && styles.activeTab]}
          onPress={() => setActiveTab('transactions')}
        >
          <Text style={[styles.tabText, activeTab === 'transactions' && styles.activeTabText]}>
            Transactions
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === 'notifications' ? (
        <NotificationsScreen />
      ) : (
        <ScrollView 
          style={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        >      {/* Pending Notifications Section */}
      {pendingNotifications.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={20} color={Colors.light.tint} />
            <Text style={styles.sectionTitle}>Pending Food Requests</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingNotifications.length}</Text>
            </View>
          </View>
          
          {pendingNotifications.map((notification) => (
            <View key={notification.$id} style={styles.notificationCard}>              <View style={styles.notificationHeader}>
                <Text style={styles.requesterName}>Food Request</Text>
                <Text style={styles.timestamp}>{formatNotificationDate(notification.createdAt)}</Text>
              </View>
              
              <Text style={styles.message}>"{notification.message}"</Text>
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleRejectNotification(notification)}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAcceptNotification(notification)}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Pending Transaction Requests Section (fallback for any direct transaction requests) */}
      {pendingRequests.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications" size={20} color={Colors.light.tint} />
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pendingRequests.length}</Text>
            </View>
          </View>
          
          {pendingRequests.map((transaction) => (
            <View key={transaction.$id} style={styles.notificationCard}>
              <View style={styles.notificationHeader}>
                <Text style={styles.requesterName}>{transaction.requesterName}</Text>
                <Text style={styles.timestamp}>{formatDate(transaction.requestedDate)}</Text>
              </View>
              
              <Text style={styles.foodTitle}>"{transaction.foodTitle}"</Text>
              
              {transaction.requestMessage && (
                <Text style={styles.message}>"{transaction.requestMessage}"</Text>
              )}
              
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.rejectButton]}
                  onPress={() => handleRejectRequest(transaction)}
                >
                  <Ionicons name="close" size={16} color="#fff" />
                  <Text style={styles.rejectButtonText}>Reject</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.acceptButton]}
                  onPress={() => handleAcceptRequest(transaction)}
                >
                  <Ionicons name="checkmark" size={16} color="#fff" />
                  <Text style={styles.acceptButtonText}>Accept</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Accepted Transactions Section */}
      {acceptedTransactions.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="chatbubbles" size={20} color={Colors.light.tint} />
            <Text style={styles.sectionTitle}>Active Swaps</Text>
          </View>
          
          {acceptedTransactions.map((transaction) => (
            <TouchableOpacity 
              key={transaction.$id} 
              style={styles.activeSwapCard}
              onPress={() => onTransactionSelect?.(transaction.$id!)}
            >
              <View style={styles.swapHeader}>
                <Text style={styles.swapTitle}>{transaction.foodTitle}</Text>
                <Ionicons name="chevron-forward" size={16} color="#666" />
              </View>
              
              <Text style={styles.swapParticipants}>
                {transaction.ownerId === user?.$id 
                  ? `Swapping with ${transaction.requesterName}`
                  : `Swapping with ${transaction.ownerName}`
                }
              </Text>
              
              <View style={styles.statusIndicator}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>In Progress - Tap to chat</Text>
              </View>
            </TouchableOpacity>
          ))}        </View>
      )}      {/* Empty State */}
      {pendingNotifications.length === 0 && pendingRequests.length === 0 && acceptedTransactions.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={48} color="#ccc" />
          <Text style={styles.emptyTitle}>No notifications</Text>
          <Text style={styles.emptyMessage}>
            Food swap requests and active transactions will appear here
          </Text>
        </View>
      )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  tabHeader: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.light.tint,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: Colors.light.tint,
  },
  scrollContent: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
    color: Colors.light.tint,
  },
  badge: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  notificationCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  requesterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  foodTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.tint,
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  acceptButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  activeSwapCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  swapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  swapTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  swapParticipants: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});
