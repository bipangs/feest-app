import { useThemeColor } from '@/hooks/useThemeColor';
import { ChatMessage } from '@/types/chat';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

interface MessageBubbleProps {
  message: ChatMessage;
  isMyMessage: boolean;
  showSender: boolean;
  showTime: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMyMessage,
  showSender,
  showTime,
}) => {
  const textColor = useThemeColor({}, 'text');
  const cardBackground = useThemeColor({}, 'cardBackground');
  const primaryButtonColor = useThemeColor({}, 'primaryButton');
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 8,
    }).start();
  }, []);

  const formatMessageTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <Animated.View 
      style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      {showSender && !isMyMessage && (
        <Text style={[styles.senderName, { color: primaryButtonColor }]}>
          {message.senderName}
        </Text>
      )}
      
      <View style={[
        styles.messageBubble,
        isMyMessage ? [styles.myMessage, { backgroundColor: primaryButtonColor }] : 
                     [styles.otherMessage, { backgroundColor: cardBackground }]
      ]}>
        <Text style={[
          styles.messageText,
          { color: isMyMessage ? 'white' : textColor }
        ]}>
          {message.message}
        </Text>
        
        <View style={styles.messageFooter}>
          <Text style={[
            styles.bubbleTime,
            { color: isMyMessage ? 'rgba(255,255,255,0.7)' : secondaryTextColor }
          ]}>
            {formatMessageTime(new Date(message.createdAt))}
          </Text>
          
          {isMyMessage && (
            <Ionicons 
              name="checkmark-done" 
              size={16} 
              color="rgba(255,255,255,0.7)" 
              style={styles.readReceiptIcon}
            />          )}
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 2,
    marginHorizontal: 16,
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    marginLeft: 8,
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  myMessage: {
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  bubbleTime: {
    fontSize: 11,
  },
  readReceiptIcon: {
    marginLeft: 4,
  },
});
