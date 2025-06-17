import { CustomColors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { ChatService } from '@/services/chatService';
import { ChatRoom } from '@/types/chat';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const { userProfile } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoomName, setNewRoomName] = useState('');
  const [newRoomDescription, setNewRoomDescription] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadChatRooms();
    }, [])
  );

  const loadChatRooms = async () => {
    if (!userProfile) return;
    
    try {
      setLoading(true);
      const rooms = await ChatService.getUserChatRooms();
      setChatRooms(rooms);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  const createChatRoom = async () => {
    if (!newRoomName.trim()) {
      Alert.alert('Error', 'Please enter a room name');
      return;
    }

    try {
      setLoading(true);
      await ChatService.createChatRoom(newRoomName.trim(), newRoomDescription.trim());
      setNewRoomName('');
      setNewRoomDescription('');
      setShowCreateRoom(false);
      loadChatRooms();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create chat room');
    } finally {
      setLoading(false);
    }
  };

  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <TouchableOpacity style={styles.chatRoomItem}>
      <View style={styles.chatRoomHeader}>
        <Text style={styles.roomName}>{item.name}</Text>
        <Text style={styles.lastMessageTime}>
          {item.lastMessageTime ? formatTime(item.lastMessageTime) : 'No messages'}
        </Text>
      </View>
      {item.description && (
        <Text style={styles.roomDescription} numberOfLines={1}>
          {item.description}
        </Text>
      )}
      {item.lastMessage && (
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      )}
      <View style={styles.chatRoomFooter}>
        <Text style={styles.participantCount}>
          {item.participants.length} participant{item.participants.length !== 1 ? 's' : ''}
        </Text>
        {item.createdBy === userProfile?.$id && (
          <View style={styles.ownerBadge}>
            <Text style={styles.ownerText}>Owner</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>Please log in to access chat</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>      <View style={styles.header}>
        <Text style={styles.title}>Chat Rooms</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setShowCreateRoom(!showCreateRoom)}
        >
          <Text style={styles.createButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {showCreateRoom && (
        <View style={styles.createRoomForm}>
          <TextInput
            style={styles.input}
            placeholder="Room name"
            value={newRoomName}
            onChangeText={setNewRoomName}
            maxLength={50}
          />
          <TextInput
            style={[styles.input, styles.descriptionInput]}
            placeholder="Room description (optional)"
            value={newRoomDescription}
            onChangeText={setNewRoomDescription}
            maxLength={200}
            multiline
          />
          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => {
                setShowCreateRoom(false);
                setNewRoomName('');
                setNewRoomDescription('');
              }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.createRoomButton]}
              onPress={createChatRoom}
              disabled={loading}
            >
              <Text style={styles.createRoomButtonText}>
                {loading ? 'Creating...' : 'Create'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}      <View style={styles.userInfo}>
        <Text style={styles.userName}>{userProfile.name}</Text>
      </View>

      <FlatList
        data={chatRooms}
        renderItem={renderChatRoom}
        keyExtractor={(item) => item.$id!}
        style={styles.chatRoomList}
        contentContainerStyle={styles.chatRoomListContent}
        refreshing={loading}
        onRefresh={loadChatRooms}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              No chat rooms yet. Create one to get started!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: CustomColors.black,
  },  createButton: {
    width: 40,
    height: 40,
    borderRadius: 20,    backgroundColor: CustomColors.darkForestGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  createRoomForm: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  descriptionInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: CustomColors.black,
    fontWeight: '600',
  },
  createRoomButton: {
    backgroundColor: CustomColors.darkForestGreen,
  },
  createRoomButtonText: {
    color: 'white',
    fontWeight: '600',
  },  userInfo: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  userName: {
    fontSize: 16,
    color: CustomColors.black,
    fontWeight: '500',
  },
  chatRoomList: {
    flex: 1,
  },
  chatRoomListContent: {
    padding: 20,
  },
  chatRoomItem: {
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  chatRoomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CustomColors.black,
    flex: 1,
  },
  lastMessageTime: {
    fontSize: 12,
    color: '#666',
  },
  roomDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  lastMessage: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  chatRoomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  participantCount: {
    fontSize: 12,
    color: '#666',
  },
  ownerBadge: {
    backgroundColor: CustomColors.darkForestGreen,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  ownerText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
