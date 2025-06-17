import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface LocationDebugInfoProps {
  locationIP?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  showDebugInfo?: boolean;
}

export function LocationDebugInfo({ 
  locationIP, 
  latitude, 
  longitude, 
  location,
  showDebugInfo = false 
}: LocationDebugInfoProps) {
  if (!showDebugInfo) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="information-circle-outline" size={16} color={Colors.light.icon} />
        <ThemedText style={styles.title}>Location Debug Info</ThemedText>
      </View>
      
      {locationIP && (
        <View style={styles.row}>
          <ThemedText style={styles.label}>IP Address:</ThemedText>
          <ThemedText style={styles.value}>{locationIP}</ThemedText>
        </View>
      )}
      
      {latitude && longitude && (
        <View style={styles.row}>
          <ThemedText style={styles.label}>Coordinates:</ThemedText>
          <ThemedText style={styles.value}>
            {latitude.toFixed(4)}, {longitude.toFixed(4)}
          </ThemedText>
        </View>
      )}
      
      {location && (
        <View style={styles.row}>
          <ThemedText style={styles.label}>Address:</ThemedText>
          <ThemedText style={styles.value}>{location}</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    minWidth: 80,
    color: Colors.light.icon,
  },
  value: {
    fontSize: 12,
    flex: 1,
  },
});
