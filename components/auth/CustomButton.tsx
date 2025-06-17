import { CustomColors } from '@/constants/Colors';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';

interface CustomButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  disabled?: boolean;
}

export const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}) => {
  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return [styles.button, styles.primaryButton];
      case 'secondary':
        return [styles.button, styles.secondaryButton];
      case 'outline':
        return [styles.button, styles.outlineButton];
      default:
        return [styles.button, styles.primaryButton];
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      default:
        return styles.primaryText;
    }
  };

  return (
    <TouchableOpacity
      style={[
        ...getButtonStyle(),
        (disabled || loading) && styles.disabledButton
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? CustomColors.white : CustomColors.darkForestGreen} 
          size="small" 
        />
      ) : (
        <Text style={[getTextStyle(), (disabled || loading) && styles.disabledText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: CustomColors.darkForestGreen,
  },
  secondaryButton: {
    backgroundColor: '#F0F0F0',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: CustomColors.darkForestGreen,
  },
  disabledButton: {
    opacity: 0.6,
  },
  primaryText: {
    color: CustomColors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryText: {
    color: CustomColors.black,
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: CustomColors.darkForestGreen,
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.7,
  },
});
