import { ChatStatus } from '@/components/chat/ChatStatus';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ChatService } from '@/services/chatService';
import { ChatMessage, ChatRoom } from '@/types/chat';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChatRoomScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { user, userProfile } = useAuth();
  const [chatRoom, setChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const headerBackground = useThemeColor({}, 'headerBackground');
  const borderColor = useThemeColor({}, 'borderColor');
  const primaryButtonColor = useThemeColor({}, 'primaryButton');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const inputBackground = useThemeColor({}, 'cardBackground');

  const loadChatRoom = async () => {
    try {
      if (!roomId) return;
      
      const room = await ChatService.getChatRoomById(roomId);
      setChatRoom(room);
        const roomMessages = await ChatService.getChatMessages(roomId);
      setMessages(roomMessages.reverse()); // Reverse to show oldest first
    } catch (error) {
      console.error('Error loading chat room:', error);
      Alert.alert('Error', 'Failed to load chat room');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadChatRoom();
    
    // Set up polling for new messages (simulate real-time)
    const messagePolling = setInterval(async () => {
      try {
        if (roomId) {
          const roomMessages = await ChatService.getChatMessages(roomId);
          const reversedMessages = roomMessages.reverse();
          
          setMessages(prev => {
            if (prev.length !== reversedMessages.length) {
              // New messages found, scroll to bottom
              setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
              }, 100);
            }
            return reversedMessages;
          });
        }
      } catch (error) {
        // Silently fail for polling
      }
    }, 3000); // Poll every 3 seconds

    return () => clearInterval(messagePolling);
  }, [roomId]);
  const sendMessage = async () => {
    if (!newMessage.trim() || !roomId || !user) return;

    try {
      const message = await ChatService.sendMessage(
        roomId,
        newMessage.trim(),
        'text'
      );
      
      setMessages(prev => [...prev, message]);
      setNewMessage('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const isMyMessage = (message: ChatMessage) => {
    return message.senderId === user?.$id;
  };
  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isMe = isMyMessage(item);
    const showSender = !isMe && (index === 0 || messages[index - 1]?.senderId !== item.senderId);
    const showTime = index === messages.length - 1 || 
      messages[index + 1]?.senderId !== item.senderId ||
      (messages[index + 1] && new Date(messages[index + 1].createdAt).getTime() - new Date(item.createdAt).getTime() > 300000); // 5 minutes

    return (
      <MessageBubble
        message={item}
        isMyMessage={isMe}
        showSender={showSender}
        showTime={showTime}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: textColor }]}>Loading chat...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!chatRoom) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: textColor }]}>Chat room not found</Text>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: primaryButtonColor }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: headerBackground, borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
          <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: textColor }]} numberOfLines={1}>
            {chatRoom.name}
          </Text>
          <ChatStatus participantCount={chatRoom.participants.length} />
        </View>
        
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="information-circle-outline" size={24} color={textColor} />
        </TouchableOpacity>
      </View>      {/* Messages List */}
      <View style={[styles.messagesBackground, { backgroundColor }]}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.$id!}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Message Input */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={[styles.inputContainer, { backgroundColor: headerBackground, borderTopColor: borderColor }]}>
          <View style={[styles.inputWrapper, { backgroundColor: inputBackground }]}>
            <TextInput
              style={[styles.textInput, { color: textColor }]}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              placeholderTextColor={secondaryTextColor}
              multiline
              maxLength={1000}
            />
            <TouchableOpacity
              style={[styles.sendButton, { backgroundColor: primaryButtonColor }]}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
            >
              <Ionicons 
                name="send" 
                size={20} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backIcon: {
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  headerAction: {
    marginLeft: 12,
  },  messagesList: {
    flex: 1,
  },
  messagesBackground: {
    flex: 1,
  },
  messagesContent: {
    paddingVertical: 8,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 20,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
