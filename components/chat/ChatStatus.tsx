import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ChatStatusProps {
  participantCount: number;
  isTyping?: boolean;
  typingUser?: string;
}

export const ChatStatus: React.FC<ChatStatusProps> = ({ 
  participantCount, 
  isTyping = false, 
  typingUser 
}) => {
  const secondaryTextColor = useThemeColor({}, 'secondaryText');
  
  const getStatusText = () => {
    if (isTyping && typingUser) {
      return `${typingUser} is typing...`;
    }
    
    if (participantCount <= 1) {
      return 'No other participants';
    } else if (participantCount === 2) {
      return 'Online';
    } else {
      return `${participantCount} participants`;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.statusText, { color: secondaryTextColor }]}>
        {getStatusText()}
      </Text>
      {isTyping && (
        <View style={styles.typingIndicator}>
          <View style={[styles.dot, { backgroundColor: secondaryTextColor }]} />
          <View style={[styles.dot, { backgroundColor: secondaryTextColor }]} />
          <View style={[styles.dot, { backgroundColor: secondaryTextColor }]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
  },
  typingIndicator: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 1,
  },
});
