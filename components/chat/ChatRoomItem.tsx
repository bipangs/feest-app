import { useThemeColor } from '@/hooks/useThemeColor';
import { ChatRoom } from '@/types/chat';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ChatRoomItemProps {
  chatRoom: ChatRoom;
  onPress: (room: ChatRoom) => void;
}

export const ChatRoomItem: React.FC<ChatRoomItemProps> = ({ chatRoom, onPress }) => {
  const textColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const primaryButtonColor = useThemeColor({}, 'primaryButton');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  const tertiaryTextColor = useThemeColor({}, 'tertiaryText');

  const formatTime = (date: Date) => {
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } else {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const isYesterday = date.toDateString() === yesterday.toDateString();
      
      if (isYesterday) {
        return 'Yesterday';
      } else {
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
      }
    }
  };

  const getAvatarText = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <TouchableOpacity 
      style={[styles.container, { backgroundColor: cardBackground }]} 
      onPress={() => onPress(chatRoom)}
      activeOpacity={0.7}
    >
      <View style={[styles.avatar, { backgroundColor: primaryButtonColor + '20' }]}>
        <Text style={[styles.avatarText, { color: primaryButtonColor }]}>
          {getAvatarText(chatRoom.name)}
        </Text>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: textColor }]} numberOfLines={1}>
            {chatRoom.name}
          </Text>
          <Text style={[styles.time, { color: tertiaryTextColor }]}>
            {formatTime(chatRoom.lastMessageTime || chatRoom.createdAt)}
          </Text>
        </View>
        
        <View style={styles.messageRow}>
          <Text style={[styles.lastMessage, { color: secondaryTextColor }]} numberOfLines={1}>
            {chatRoom.lastMessage || chatRoom.description || 'No messages yet'}
          </Text>
          
          {chatRoom.isPrivate && (
            <Ionicons 
              name="lock-closed" 
              size={14} 
              color={tertiaryTextColor} 
              style={styles.lockIcon}
            />
          )}
        </View>
      </View>
      
      <Ionicons name="chevron-forward" size={16} color={tertiaryTextColor} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 2,
    borderRadius: 12,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  time: {
    fontSize: 12,
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  lockIcon: {
    marginLeft: 4,
  },
});
