import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionDemo } from '@/components/transactions/TransactionDemo';

export default function TransactionsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <TransactionDemo />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
