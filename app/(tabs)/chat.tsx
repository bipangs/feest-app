import { ChatRoomItem } from '@/components/chat/ChatRoomItem';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ChatService } from '@/services/chatService';
import { ChatRoom } from '@/types/chat';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatScreen() {
  const { userProfile, user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const cardColor = useThemeColor({}, 'card');
  const borderColor = useThemeColor({}, 'border');

  const loadChatRooms = async () => {
    try {
      if (user) {
        const rooms = await ChatService.getUserChatRooms();
        setChatRooms(rooms);
      }
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      Alert.alert('Error', 'Failed to load chat rooms');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadChatRooms();
    }, [user])
  );

  const createNewChatRoom = () => {
    Alert.prompt(
      'Create Chat Room',
      'Enter a name for the new chat room:',
      async (roomName) => {
        if (roomName?.trim()) {
          try {
            await ChatService.createChatRoom(
              roomName.trim(),
              `Created by ${userProfile?.name || 'User'}`,
              false // public room
            );
            loadChatRooms();
            Alert.alert('Success', 'Chat room created successfully!');
          } catch (error) {
            console.error('Error creating chat room:', error);
            Alert.alert('Error', 'Failed to create chat room');
          }
        }
      }
    );
  };  const openChatRoom = (room: ChatRoom) => {
    // Navigate to the chat room screen using dynamic route
    router.push({
      pathname: '/chat-room/[roomId]',
      params: { roomId: room.$id! }
    });
  };

  const joinChatRoom = async (roomId: string) => {
    try {
      await ChatService.joinChatRoom(roomId);
      Alert.alert('Success', 'Joined chat room successfully!');
      loadChatRooms();
    } catch (error) {
      console.error('Error joining chat room:', error);
      Alert.alert('Error', 'Failed to join chat room');
    }
  };  const renderChatRoom = ({ item }: { item: ChatRoom }) => (
    <ChatRoomItem chatRoom={item} onPress={openChatRoom} />
  );if (!userProfile) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
        <View style={[styles.header, { backgroundColor: cardColor, borderBottomColor: borderColor }]}>
          <Text style={[styles.title, { color: textColor }]}>Chat</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={iconColor} />
          <Text style={[styles.emptyText, { color: textColor }]}>Please log in to access chat features</Text>
        </View>
      </SafeAreaView>
    );
  }  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top']}>
      <View style={[styles.header, { backgroundColor: cardColor, borderBottomColor: borderColor }]}>
        <Text style={[styles.title, { color: textColor }]}>Chat Rooms</Text>
        <TouchableOpacity style={[styles.createButton, { backgroundColor: tintColor }]} onPress={createNewChatRoom}>
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      {loading ? (
        <View style={[styles.emptyContainer, { backgroundColor }]}>
          <Text style={[styles.emptyText, { color: textColor }]}>Loading chat rooms...</Text>
        </View>
      ) : chatRooms.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor }]}>
          <Ionicons name="chatbubbles-outline" size={64} color={iconColor} />
          <Text style={[styles.emptyText, { color: textColor }]}>No chat rooms yet</Text>
          <Text style={[styles.emptySubtext, { color: iconColor }]}>
            Create a new chat room or join food swap chats through transactions
          </Text>
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          renderItem={renderChatRoom}
          keyExtractor={(item) => item.$id!}
          style={[styles.chatList, { backgroundColor }]}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  createButton: {
    padding: 8,
    borderRadius: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  chatList: {
    flex: 1,
    paddingTop: 8,
  },
});
