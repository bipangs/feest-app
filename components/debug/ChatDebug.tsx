import { ChatService } from '@/services/chatService';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function ChatDebug() {
  const handleCheckCollections = async () => {
    try {
      console.log('=== Starting Chat Debug ===');
      await ChatService.checkCollections();
      console.log('=== Chat Debug Complete ===');
      Alert.alert('Debug Complete', 'Check the console for collection status details');
    } catch (error: any) {
      console.error('Debug failed:', error);
      Alert.alert('Debug Error', error.message);
    }
  };

  const handleTestChatRooms = async () => {
    try {
      console.log('=== Testing Chat Rooms Fetch ===');
      const rooms = await ChatService.getUserChatRooms();
      console.log(`Found ${rooms.length} chat rooms`);
      Alert.alert('Chat Rooms Test', `Found ${rooms.length} chat rooms. Check console for details.`);
    } catch (error: any) {
      console.error('Chat rooms test failed:', error);
      Alert.alert('Chat Rooms Test Failed', error.message);
    }
  };

  const handleTestCreateRoom = async () => {
    try {
      console.log('=== Testing Chat Room Creation ===');
      const room = await ChatService.createChatRoom(
        'Debug Test Room',
        'Testing room creation from debug component',
        false,
        []
      );
      console.log('Created room:', room);
      Alert.alert('Room Created', `Successfully created room: ${room.name}`);
    } catch (error: any) {
      console.error('Create room test failed:', error);
      Alert.alert('Create Room Test Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat Service Debug</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleCheckCollections}>
        <Text style={styles.buttonText}>Check All Collections</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleTestChatRooms}>
        <Text style={styles.buttonText}>Test Fetch Chat Rooms</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleTestCreateRoom}>
        <Text style={styles.buttonText}>Test Create Chat Room</Text>
      </TouchableOpacity>

      <Text style={styles.info}>
        Check the console for detailed debug information including collection IDs and error messages.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  info: {
    marginTop: 15,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
