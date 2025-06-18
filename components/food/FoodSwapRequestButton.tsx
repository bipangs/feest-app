import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { FoodService } from '@/services/foodService';
import { FoodItem } from '@/types/food';
import { TransactionDebugger } from '@/utils/transactionDebugger';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface FoodSwapRequestButtonProps {
  foodItem: FoodItem;
  onRequestSent?: () => void;
  disabled?: boolean;
}

export function FoodSwapRequestButton({ 
  foodItem, 
  onRequestSent,
  disabled = false 
}: FoodSwapRequestButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [message, setMessage] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPress = () => {
    if (disabled || foodItem.status !== 'available') {
      Alert.alert('Unavailable', 'This food item is no longer available for swap.');
      return;
    }
    setShowModal(true);
  };  const handleSendRequest = async () => {
    if (isRequesting) return;
    
    console.log('🔄 Starting food swap request for:', foodItem.title);
    setIsRequesting(true);
    
    try {
      // First, run a quick debug test
      console.log('🧪 Running transaction debug test...');
      const debugResult = await TransactionDebugger.testDatabaseAccess();
      
      if (!debugResult.success) {
        console.error('❌ Database test failed:', debugResult.message);
        Alert.alert(
          'Database Error', 
          debugResult.message + '\n\nPlease check that the "transactions" collection exists in your Appwrite database.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      console.log('📤 Calling FoodService.createFoodSwapRequest...');
      const result = await FoodService.createFoodSwapRequest(
        foodItem.$id!,
        message.trim() || undefined
      );

      console.log('📥 Request result:', result);      if (result.success) {
        console.log('✅ Request successful:', result.message);
        Alert.alert(
          'Request Sent!', 
          result.message,
          [
            {
              text: 'OK',
              onPress: () => {
                setShowModal(false);
                setMessage('');
                onRequestSent?.();
              }
            }
          ]
        );
      } else {
        console.log('❌ Request failed:', result.message);
        Alert.alert('Error', result.message);
      }
    } catch (error: any) {
      console.error('💥 Request error:', error);
      
      let errorMessage = `Failed to send request: ${error.message}`;
      
      // Check for specific database errors
      if (error.message.includes('Collection with the requested ID could not be found')) {
        errorMessage = 'Database Error: The "transactions" collection was not found. Please create it in your Appwrite database first.';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsRequesting(false);
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setMessage('');
  };
  const isAvailable = foodItem.status === 'available';
  const isPending = isRequesting;
  const isButtonDisabled = disabled || !isAvailable || isPending;
    const buttonStyle = [
    styles.button,
    isButtonDisabled ? styles.disabledButton : styles.enabledButton,
    isPending ? styles.pendingButton : null
  ].filter(Boolean);
  const textStyle = [
    styles.buttonText,
    isButtonDisabled ? styles.disabledText : styles.enabledText
  ];

  return (
    <>      <TouchableOpacity
        style={buttonStyle}
        onPress={handleRequestPress}
        disabled={isButtonDisabled}
      >
        <Text style={textStyle}>
          {isPending ? 'Pending...' : isAvailable ? 'Request Swap' : 'Not Available'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <ThemedView style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Request Food Swap</ThemedText>
              <ThemedText style={styles.modalSubtitle}>
                Send a request to {foodItem.ownerName} for "{foodItem.title}"
              </ThemedText>
            </View>

            <View style={styles.messageContainer}>
              <ThemedText style={styles.messageLabel}>
                Message (optional):
              </ThemedText>
              <TextInput
                style={styles.messageInput}
                placeholder="Hi! I'm interested in swapping for your food item. What would you like in exchange?"
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
              <ThemedText style={styles.characterCount}>
                {message.length}/500 characters
              </ThemedText>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={handleCancel}
                disabled={isRequesting}
              >
                <Text style={[styles.modalButtonText, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.sendButton]}
                onPress={handleSendRequest}
                disabled={isRequesting}
              >
                <Text style={[styles.modalButtonText, styles.sendButtonText]}>
                  {isRequesting ? 'Sending...' : 'Send Request'}
                </Text>
              </TouchableOpacity>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },  enabledButton: {
    backgroundColor: Colors.light.tint,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  pendingButton: {
    backgroundColor: '#f0ad4e',
    opacity: 0.8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  enabledText: {
    color: '#fff',
  },
  disabledText: {
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.light.tint,
  },
  modalSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
  messageContainer: {
    marginBottom: 20,
  },
  messageLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.tint,
  },
  messageInput: {
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    backgroundColor: '#f8f9fa',
  },
  characterCount: {
    fontSize: 12,
    opacity: 0.6,
    textAlign: 'right',
    marginTop: 4,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#ccc',
  },
  sendButton: {
    backgroundColor: Colors.light.tint,
    borderWidth: 2,
    borderColor: Colors.light.tint,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButtonText: {
    color: '#666',
  },
  sendButtonText: {
    color: '#fff',
  },
});
