import { CustomColors } from '@/constants/Colors';
import { Image } from 'expo-image';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export const LoadingScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/feest_logo.jpg')}
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
    backgroundColor: CustomColors.white,
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
