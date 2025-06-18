import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface ScrollToBottomButtonProps {
  onPress: () => void;
  visible: boolean;
}

export const ScrollToBottomButton: React.FC<ScrollToBottomButtonProps> = ({ 
  onPress, 
  visible 
}) => {
  const primaryButtonColor = useThemeColor({}, 'primaryButton');

  if (!visible) return null;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: primaryButtonColor }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons name="chevron-down" size={20} color="white" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
