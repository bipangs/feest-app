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
      );

      if (response.success) {
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
      </View>

      <View style={styles.content}>
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
              maxLength={500}
            />

            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.rejectButton]}
                onPress={() => handleResponse(false)}
                disabled={isResponding}
              >
                <Text style={[styles.buttonText, styles.rejectButtonText]}>
                  {isResponding ? 'Processing...' : 'Decline'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.acceptButton]}
                onPress={() => handleResponse(true)}
                disabled={isResponding}
              >
                <Text style={styles.buttonText}>
                  {isResponding ? 'Processing...' : 'Accept'}
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
    backgroundColor: Colors.light.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  header: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.tabIconDefault,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.light.tint,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    opacity: 0.6,
  },
  content: {
    gap: 12,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
  },
  responseContainer: {
    marginTop: 8,
  },
  responseLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  responseInput: {
    borderWidth: 1,
    borderColor: Colors.light.tabIconDefault,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  acceptButton: {
    backgroundColor: Colors.light.tint,
  },
  rejectButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  rejectButtonText: {
    color: '#FF6B6B',
  },
});
