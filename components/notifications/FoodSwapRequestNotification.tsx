import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { FoodService } from '@/services/foodService';
import { SimpleNotification } from '@/types/notification';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface FoodSwapRequestNotificationProps {
  notification: SimpleNotification;
  onRespond: (notificationId: string, response: 'accepted' | 'rejected') => void;
}

export function FoodSwapRequestNotification({ 
  notification, 
  onRespond 
}: FoodSwapRequestNotificationProps) {
  const [responseMessage, setResponseMessage] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  const handleResponse = async (accept: boolean) => {
    if (isResponding) return;
    
    setIsResponding(true);
    
    try {
      const response = await FoodService.respondToFoodSwapNotification(
        notification.$id!,
        accept ? 'accepted' : 'rejected',
        responseMessage || undefined
      );      if (response.success) {
        Alert.alert(
          accept ? 'Request Accepted!' : 'Request Rejected',
          response.message
        );
        onRespond(notification.$id!, accept ? 'accepted' : 'rejected');
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error: any) {
      Alert.alert('Error', `Failed to respond to request: ${error.message}`);
    } finally {
      setIsResponding(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>
          {notification.type === 'food_request' ? 'Food Swap Request' : 
           notification.type === 'request_accepted' ? 'Request Accepted' :
           'Request Update'}
        </ThemedText>
        <ThemedText style={styles.timestamp}>
          {notification.createdAt.toLocaleDateString()} at {notification.createdAt.toLocaleTimeString()}
        </ThemedText>
      </View>      <View style={styles.content}>
        <ThemedText style={styles.message}>{notification.message}</ThemedText>
        
        {notification.type === 'food_request' && !notification.read && (
          <View style={styles.responseContainer}>
            <ThemedText style={styles.responseLabel}>Your response (optional):</ThemedText>
            <TextInput
              style={styles.responseInput}
              placeholder="Add a message to your response..."
              value={responseMessage}
              onChangeText={setResponseMessage}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() => handleResponse(false)}
                disabled={isResponding}
              >
                <Text style={[styles.buttonText, styles.rejectButtonText]}>
                  {isResponding ? 'Processing...' : 'Reject'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={() => handleResponse(true)}
                disabled={isResponding}
              >
                <Text style={[styles.buttonText, styles.acceptButtonText]}>
                  {isResponding ? 'Processing...' : 'Accept & Create Transaction'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
    borderLeftColor: Colors.light.tint,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  content: {
    gap: 12,
  },  requesterName: {
    fontSize: 16,
    fontWeight: '600',
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.tint,
  },
  messageContainer: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  messageLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: Colors.light.tint,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  responseContainer: {
    marginTop: 8,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.tint,
  },
  responseInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1e5e9',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#dc3545',
  },
  acceptButton: {
    backgroundColor: '#28a745',
    borderWidth: 2,
    borderColor: '#28a745',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  rejectButtonText: {
    color: '#dc3545',
  },
  acceptButtonText: {
    color: '#fff',
  },
});
