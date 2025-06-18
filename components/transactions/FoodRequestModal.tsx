import { AuthenticatedImage } from '@/components/ui/AuthenticatedImage';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { TransactionService } from '@/services/transactionService';
import { FoodItem } from '@/types/food';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface FoodRequestModalProps {
  visible: boolean;
  foodItem: FoodItem | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const FoodRequestModal: React.FC<FoodRequestModalProps> = ({
  visible,
  foodItem,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!foodItem || !user) return;

    if (user.$id === foodItem.ownerId) {
      Alert.alert('Error', 'You cannot request your own food item');
      return;
    }

    setLoading(true);
    try {
      await TransactionService.createTransaction(
        foodItem.$id!,
        foodItem.ownerId,
        foodItem.ownerName,
        message.trim() || undefined
      );

      Alert.alert(
        'Request Sent!',
        'Your food request has been sent. You can chat with the owner to arrange pickup.',
        [
          {
            text: 'OK',
            onPress: () => {
              setMessage('');
              onClose();
              onSuccess?.();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating transaction:', error);
      Alert.alert('Error', 'Failed to send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays === 1) {
      return 'Expires tomorrow';
    } else {
      return `Expires in ${diffDays} days`;
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

  if (!foodItem) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Request Food</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Food Item Info */}
          <View style={styles.foodItemCard}>            {foodItem.imageUrl && (
              <AuthenticatedImage uri={foodItem.imageUrl} style={styles.foodImage} />
            )}
            <View style={styles.foodInfo}>
              <View style={styles.titleRow}>
                <Text style={styles.categoryEmoji}>{getCategoryEmoji(foodItem.category)}</Text>
                <Text style={styles.foodTitle}>{foodItem.title}</Text>
              </View>
              <Text style={styles.foodDescription}>{foodItem.description}</Text>
              <Text style={styles.foodOwner}>by {foodItem.ownerName}</Text>
              <Text style={styles.expiryDate}>{formatDate(foodItem.expiryDate)}</Text>
            </View>
          </View>

          {/* Message Input */}
          <View style={styles.messageSection}>
            <Text style={styles.sectionTitle}>Add a message (optional)</Text>
            <Text style={styles.sectionSubtitle}>
              Let the owner know why you're interested or any special arrangements needed.
            </Text>
            <TextInput
              style={styles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Hi! I'm interested in your food item..."
              multiline
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.characterCount}>{message.length}/500</Text>
          </View>

          {/* Info Section */}
          <View style={styles.infoSection}>
            <View style={styles.infoItem}>
              <Ionicons name="chatbubbles" size={20} color={Colors.light.tint} />
              <Text style={styles.infoText}>
                A private chat will be created between you and the owner
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="notifications" size={20} color={Colors.light.tint} />
              <Text style={styles.infoText}>
                The owner will be notified of your request
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="camera" size={20} color={Colors.light.tint} />
              <Text style={styles.infoText}>
                The owner will need to take a completion photo when done
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={onClose}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <Text style={styles.submitButtonText}>Sending...</Text>
            ) : (
              <>
                <Ionicons name="send" size={20} color="white" />
                <Text style={styles.submitButtonText}>Send Request</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  foodItemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  foodInfo: {
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  foodTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  foodDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  foodOwner: {
    fontSize: 14,
    color: Colors.light.tint,
    fontWeight: '500',
  },
  expiryDate: {
    fontSize: 14,
    color: '#FF9500',
    fontWeight: '500',
  },
  messageSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  messageInput: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    height: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
    marginTop: 4,
  },
  infoSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e1e5e9',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.tint,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
