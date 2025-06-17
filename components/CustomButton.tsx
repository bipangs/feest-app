import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from './ThemedText';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
  icon?: string;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'small' | 'medium' | 'large';
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  style,
  textStyle,
  size = 'medium',
}) => {
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');

  const getButtonStyle = () => {
    const baseStyle = [styles.button, styles[size]];
    
    switch (variant) {
      case 'primary':
        return [...baseStyle, { backgroundColor: tintColor }, style];
      case 'secondary':
        return [...baseStyle, { backgroundColor: iconColor + '20' }, style];
      case 'danger':
        return [...baseStyle, { backgroundColor: '#dc3545' }, style];
      case 'outline':
        return [...baseStyle, { 
          backgroundColor: 'transparent', 
          borderWidth: 1, 
          borderColor: tintColor 
        }, style];
      default:
        return [...baseStyle, { backgroundColor: tintColor }, style];
    }
  };

  const getTextStyle = () => {
    const baseStyle = [styles.text, styles[`${size}Text`]];
    
    switch (variant) {
      case 'primary':
      case 'danger':
        return [...baseStyle, { color: 'white' }, textStyle];
      case 'secondary':
        return [...baseStyle, { color: iconColor }, textStyle];
      case 'outline':
        return [...baseStyle, { color: tintColor }, textStyle];
      default:
        return [...baseStyle, { color: 'white' }, textStyle];
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  return (
    <TouchableOpacity
      style={[
        getButtonStyle(),
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      {icon && (
        <Ionicons
          name={icon as any}
          size={getIconSize()}
          color={variant === 'primary' || variant === 'danger' ? 'white' : 
                 variant === 'outline' ? tintColor : iconColor}
          style={styles.icon}
        />
      )}
      <ThemedText style={getTextStyle()}>
        {title}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  medium: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  large: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  smallText: {
    fontSize: 12,
  },
  mediumText: {
    fontSize: 14,
  },
  largeText: {
    fontSize: 16,
  },
  icon: {
    marginRight: 6,
  },
  disabled: {
    opacity: 0.5,
  },
});
