import { LocationDebugInfo } from '@/components/debug/LocationDebugInfo';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { AuthenticatedImage } from '@/components/ui/AuthenticatedImage';
import { Colors } from '@/constants/Colors';
import { FoodItem } from '@/types/food';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface FoodHorizontalCardProps {
  item: FoodItem;
  onPress: (item: FoodItem) => void;
  showDebugInfo?: boolean;
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.8;

export function FoodHorizontalCard({ item, onPress, showDebugInfo = false }: FoodHorizontalCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return '#22c55e';
      case 'requested':
        return '#f59e0b';
      case 'completed':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.card}>
        <AuthenticatedImage uri={item.imageUri} style={styles.image} />
        
        <View style={styles.content}>
          <View style={styles.header}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {item.title}
            </ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>
          </View>
          
          <ThemedText style={styles.description} numberOfLines={2}>
            {item.description}
          </ThemedText>
          
          <View style={styles.footer}>
            <View style={styles.ownerInfo}>
              <Ionicons name="person-circle-outline" size={16} color={Colors.light.text} />
              <ThemedText style={styles.ownerText}>{item.ownerName}</ThemedText>
            </View>
            
            {item.location && (
              <View style={styles.locationInfo}>
                <Ionicons name="location-outline" size={14} color={Colors.light.text} />
                <ThemedText style={styles.locationText} numberOfLines={1}>
                  {item.location}
                </ThemedText>
              </View>
            )}
          </View>
          
          <View style={styles.metaInfo}>
            <ThemedText style={styles.timeText}>
              {formatTimeAgo(item.createdAt)}
            </ThemedText>
            {item.expiryDate && (
              <ThemedText style={styles.expiryText}>
                Expires: {new Date(item.expiryDate).toLocaleDateString()}
              </ThemedText>
            )}
          </View>
          
          {showDebugInfo && (
            <LocationDebugInfo
              locationIP={item.locationIP}
              latitude={item.latitude}
              longitude={item.longitude}
              location={item.location}
              showDebugInfo={true}
            />
          )}
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    marginBottom: 8,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ownerText: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.6,
    flex: 1,
  },
  metaInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 12,
    opacity: 0.5,
  },
  expiryText: {
    fontSize: 12,
    opacity: 0.5,
  },
});
