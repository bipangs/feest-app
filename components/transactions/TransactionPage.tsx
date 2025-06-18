import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionService } from '@/services/transactionService';
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
    View,
} from 'react-native';
import { TransactionChat } from './Chat';

interface TransactionPageProps {
  transactionId?: string;
  onBack?: () => void;
}

export const TransactionPage: React.FC<TransactionPageProps> = ({
  transactionId,
  onBack,
}) => {
  const { user } = useAuth();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (transactionId) {
      loadTransaction();
    }
  }, [transactionId]);
  const loadTransaction = async () => {
    if (!transactionId) return;

    try {
      const txn = await TransactionService.getTransactionWithChat(transactionId);
      setTransaction(txn);
    } catch (error) {
      console.error('Error loading transaction:', error);
      Alert.alert('Error', 'Failed to load transaction details.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadTransaction();
    setRefreshing(false);
  };

  const handleTransactionUpdate = (updatedTransaction: Transaction) => {
    setTransaction(updatedTransaction);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading transaction...</Text>
      </View>
    );
  }

  if (!transaction) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#FF3B30" />
        <Text style={styles.errorTitle}>Transaction Not Found</Text>
        <Text style={styles.errorMessage}>
          The transaction you're looking for could not be found.
        </Text>
        {onBack && (
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const isOwner = user?.$id === transaction.ownerId;
  const otherUserName = isOwner ? transaction.requesterName : transaction.ownerName;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.light.tint} />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Transaction</Text>
          <Text style={styles.headerSubtitle}>with {otherUserName}</Text>
        </View>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={24} color={Colors.light.tint} />
        </TouchableOpacity>
      </View>

      {/* Transaction Details */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <Text style={styles.detailsTitle}>Transaction Details</Text>
            <Text style={styles.transactionId}>#{transaction.$id?.slice(-8)}</Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Food Item</Text>
              <Text style={styles.detailValue}>{transaction.foodTitle}</Text>
            </View>

            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Requested</Text>
              <Text style={styles.detailValue}>
                {formatDate(transaction.requestedDate)}
              </Text>
              <Text style={styles.detailSubValue}>
                {getTimeAgo(transaction.requestedDate)}
              </Text>
            </View>

            {transaction.acceptedDate && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Accepted</Text>
                <Text style={styles.detailValue}>
                  {formatDate(transaction.acceptedDate)}
                </Text>
                <Text style={styles.detailSubValue}>
                  {getTimeAgo(transaction.acceptedDate)}
                </Text>
              </View>
            )}

            {transaction.completedDate && (
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Completed</Text>
                <Text style={styles.detailValue}>
                  {formatDate(transaction.completedDate)}
                </Text>
                <Text style={styles.detailSubValue}>
                  {getTimeAgo(transaction.completedDate)}
                </Text>
              </View>
            )}

            {transaction.requestMessage && (
              <View style={[styles.detailItem, styles.messageItem]}>
                <Text style={styles.detailLabel}>Initial Message</Text>
                <Text style={styles.messageText}>{transaction.requestMessage}</Text>
              </View>
            )}
          </View>
        </View>        {/* Chat Section */}
        <View style={styles.chatContainer}>
          <TransactionChat
            transaction={transaction}
            onTransactionUpdate={handleTransactionUpdate}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  refreshButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  detailsCard: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  transactionId: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 12,
  },
  messageItem: {
    borderBottomWidth: 0,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailSubValue: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
  },  chatContainer: {
    flex: 1,
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'white',
    minHeight: 400,
  },
  noChatContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noChatTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  noChatMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  backButtonText: {
    color: Colors.light.tint,
    fontSize: 16,
    fontWeight: '600',
  },
});
