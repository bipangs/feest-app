import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TransactionNotifications } from '@/components/transactions/TransactionNotifications';
import { TransactionPage } from '@/components/transactions/TransactionPage';

export default function TransactionsScreen() {
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);

  if (selectedTransactionId) {
    return (
      <SafeAreaView style={styles.container}>
        <TransactionPage 
          transactionId={selectedTransactionId}
          onBack={() => setSelectedTransactionId(null)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <TransactionNotifications 
        onTransactionSelect={setSelectedTransactionId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
