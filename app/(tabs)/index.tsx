import FoodScreen from '@/components/food/FoodScreen';
import { CustomColors } from '@/constants/Colors';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <FoodScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CustomColors.white,
  },
});
