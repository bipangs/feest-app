import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function EventsScreen() {
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Events</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Upcoming Events</ThemedText>
          <ThemedText>Discover and join exciting food events in your area.</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">My Events</ThemedText>
          <ThemedText>Events you've joined or created will appear here.</ThemedText>
        </ThemedView>
          <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Event Categories</ThemedText>
          <ThemedText>Browse events by cuisine type, location, or price range.</ThemedText>
        </ThemedView>
        
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Create Event</ThemedText>
          <ThemedText>Host your own food event and invite others to join.</ThemedText>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
