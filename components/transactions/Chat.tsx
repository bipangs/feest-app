import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService } from '@/services/chatService';
import { TransactionService } from '@/services/transactionService';
import { ChatMessage } from '@/types/chat';
import { Transaction } from '@/types/transaction';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface TransactionChatProps {
  transaction: Transaction;
  onTransactionUpdate?: (updatedTransaction: Transaction) => void;
}

export const TransactionChat: React.FC<TransactionChatProps> = ({
  transaction,
  onTransactionUpdate,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const isOwner = user?.$id === transaction.ownerId;
  const canComplete = isOwner && transaction.status === 'accepted';
  const canAccept = isOwner && transaction.status === 'pending';

  useEffect(() => {
    loadMessages();
    
    // Auto-refresh messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [transaction.chatRoomId]);

  const loadMessages = async () => {
    if (!transaction.chatRoomId) return;
    
    try {
      const chatMessages = await ChatService.getChatMessages(transaction.chatRoomId, 100);
      setMessages(chatMessages.reverse()); // Reverse to show newest at bottom
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !transaction.chatRoomId || sending) return;

    setSending(true);
    try {
      await ChatService.sendMessage(transaction.chatRoomId, newMessage.trim());
      setNewMessage('');
      await loadMessages();
      Keyboard.dismiss();
      
      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const acceptTransaction = async () => {
    Alert.alert(
      'Accept Food Request',
      'Do you want to accept this food request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: async () => {
            try {
              const updatedTransaction = await TransactionService.acceptTransaction(transaction.$id!);
              onTransactionUpdate?.(updatedTransaction);
              await loadMessages();
            } catch (error) {
              console.error('Error accepting transaction:', error);
              Alert.alert('Error', 'Failed to accept transaction. Please try again.');
            }
          },
        },
      ]
    );
  };

  const completeTransaction = async () => {
    Alert.alert(
      'Complete Transaction',
      'Take a selfie as proof of completion. This will complete the transaction.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Take Photo',
          onPress: async () => {
            // For now, we'll use a placeholder photo
            // In a real app, you'd use camera functionality
            const placeholderPhoto = 'data:image/jpeg;base64,placeholder';
            
            try {
              const updatedTransaction = await TransactionService.completeTransaction(
                transaction.$id!,
                placeholderPhoto
              );
              onTransactionUpdate?.(updatedTransaction);
              await loadMessages();
              Alert.alert(
                'Success',
                'Transaction completed! Chat will be automatically deleted in 6 hours.'
              );
            } catch (error) {
              console.error('Error completing transaction:', error);
              Alert.alert('Error', 'Failed to complete transaction. Please try again.');
            }
          },
        },
      ]
    );
  };

  const cancelTransaction = async () => {
    Alert.prompt(
      'Cancel Transaction',
      'Please provide a reason for cancellation (optional):',
      async (reason) => {
        try {
          await TransactionService.cancelTransaction(transaction.$id!, reason || undefined);
          const updatedTransaction = { ...transaction, status: 'cancelled' as const };
          onTransactionUpdate?.(updatedTransaction);
          await loadMessages();
        } catch (error) {
          console.error('Error cancelling transaction:', error);
          Alert.alert('Error', 'Failed to cancel transaction. Please try again.');
        }
      },
      'plain-text',
      '',
      'default'
    );
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isOwnMessage = item.senderId === user?.$id;
    const isSystemMessage = item.messageType === 'system';

    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessage}>{item.message}</Text>
          <Text style={styles.messageTime}>
            {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      );
    }

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessage : styles.otherMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isOwnMessage ? styles.ownMessageBubble : styles.otherMessageBubble
        ]}>
          {!isOwnMessage && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <Text style={[
            styles.messageText,
            isOwnMessage ? styles.ownMessageText : styles.otherMessageText
          ]}>
            {item.message}
          </Text>
          <Text style={[
            styles.messageTime,
            isOwnMessage ? styles.ownMessageTime : styles.otherMessageTime
          ]}>
            {item.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
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
      case 'pending': return 'Pending Response';
      case 'accepted': return 'In Progress';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading chat...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerInfo}>
          <Text style={styles.foodTitle}>{transaction.foodTitle}</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusIndicator, 
              { backgroundColor: getStatusColor(transaction.status) }
            ]} />
            <Text style={styles.statusText}>{getStatusText(transaction.status)}</Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {transaction.status !== 'cancelled' && transaction.status !== 'completed' && (
        <View style={styles.actionContainer}>
          {canAccept && (
            <TouchableOpacity style={styles.acceptButton} onPress={acceptTransaction}>
              <Ionicons name="checkmark-circle" size={20} color="white" />
              <Text style={styles.buttonText}>Accept Request</Text>
            </TouchableOpacity>
          )}
          
          {canComplete && (
            <TouchableOpacity style={styles.completeButton} onPress={completeTransaction}>
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.buttonText}>Complete with Photo</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.cancelButton} onPress={cancelTransaction}>
            <Ionicons name="close-circle" size={20} color="white" />
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.$id || item.createdAt.toString()}
        style={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      {/* Input */}
      {transaction.status !== 'cancelled' && transaction.status !== 'completed' && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendButton, (!newMessage.trim() || sending) && styles.sendButtonDisabled]}
            onPress={sendMessage}
            disabled={!newMessage.trim() || sending}
          >
            <Ionicons 
              name={sending ? "hourglass" : "send"} 
              size={24} 
              color={(!newMessage.trim() || sending) ? "#8E8E93" : Colors.light.tint} 
            />
          </TouchableOpacity>
        </View>
      )}

      {transaction.status === 'completed' && transaction.chatExpiresAt && (
        <View style={styles.expiryNotice}>
          <Text style={styles.expiryText}>
            This chat will be deleted on {transaction.chatExpiresAt.toLocaleDateString()} at {transaction.chatExpiresAt.toLocaleTimeString()}
          </Text>
        </View>
      )}
    </KeyboardAvoidingView>
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
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
  },
  headerInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#666',
  },
  actionContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e1e5e9',
    gap: 8,
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C759',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  completeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  messageContainer: {
    marginVertical: 4,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  otherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  ownMessageBubble: {
    backgroundColor: Colors.light.tint,
  },
  otherMessageBubble: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
  },
  ownMessageText: {
    color: 'white',
  },
  otherMessageText: {
    color: '#000',
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  ownMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  otherMessageTime: {
    color: '#666',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  systemMessage: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    padding: 8,
    borderRadius: 20,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  expiryNotice: {
    backgroundColor: '#FFF3CD',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
  },
  expiryText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
});
