import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';

interface HorizontalScrollSectionProps {
  title: string;
  data: any[];
  renderItem: (item: any, index: number) => React.ReactNode;
  onSeeAll?: () => void;
  emptyMessage?: string;
}

const { width } = Dimensions.get('window');

export function HorizontalScrollSection({
  title,
  data,
  renderItem,
  onSeeAll,
  emptyMessage = 'No items available'
}: HorizontalScrollSectionProps) {
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.title}>
          {title}
        </ThemedText>
        {onSeeAll && (
          <TouchableOpacity onPress={onSeeAll}>
            <ThemedText style={styles.seeAllText}>See All</ThemedText>
          </TouchableOpacity>
        )}
      </View>
      
      {data.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          decelerationRate="fast"
          snapToInterval={width * 0.8 + 16}
        >
          {data.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              {renderItem(item, index)}
            </View>
          ))}
        </ScrollView>
      ) : (
        <ThemedView style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>{emptyMessage}</ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    color: Colors.light.tint,
    fontSize: 14,
    fontWeight: '500',
  },
  scrollContent: {
    paddingLeft: 20,
    paddingRight: 4,
  },
  itemContainer: {
    marginRight: 16,
    width: width * 0.8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.6,
  },
});
