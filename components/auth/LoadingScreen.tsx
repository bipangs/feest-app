import { CustomColors } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export const LoadingScreen: React.FC = () => {
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Image
        source={require('@/assets/images/feest_loading.png')}
        style={styles.logo}
        contentFit="contain"
      />
      <ActivityIndicator
        size="large"
        color={CustomColors.darkForestGreen}
        style={styles.loader}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 32,
  },
  loader: {
    marginTop: 20,
  },
});
