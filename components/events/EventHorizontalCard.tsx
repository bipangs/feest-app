import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { Event } from '@/types/event';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Dimensions,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

interface EventHorizontalCardProps {
  item: Event;
  onPress: (item: Event) => void;
}

const { width } = Dimensions.get('window');
const cardWidth = width * 0.8;

export function EventHorizontalCard({ item, onPress }: EventHorizontalCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'upcoming':
        return '#3b82f6';
      case 'ongoing':
        return '#22c55e';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const formatDate = (date: Date) => {
    const eventDate = new Date(date);
    const today = new Date();
    const diffInDays = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays > 0 && diffInDays <= 7) return `In ${diffInDays} days`;
    
    return eventDate.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: eventDate.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(item)}
      activeOpacity={0.7}
    >
      <ThemedView style={styles.card}>
        {item.imageUri ? (
          <Image source={{ uri: item.imageUri }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="calendar-outline" size={48} color={Colors.light.text} />
          </View>
        )}
        
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
          
          <View style={styles.dateTimeInfo}>
            <View style={styles.dateInfo}>
              <Ionicons name="calendar-outline" size={16} color={Colors.light.text} />
              <ThemedText style={styles.dateText}>{formatDate(item.eventDate)}</ThemedText>
            </View>
            <View style={styles.timeInfo}>
              <Ionicons name="time-outline" size={16} color={Colors.light.text} />
              <ThemedText style={styles.timeText}>{formatTime(item.eventDate)}</ThemedText>
            </View>
          </View>
          
          <View style={styles.footer}>
            <View style={styles.organizerInfo}>
              <Ionicons name="person-circle-outline" size={16} color={Colors.light.text} />
              <ThemedText style={styles.organizerText}>{item.organizerName}</ThemedText>
            </View>
            
            <View style={styles.locationInfo}>
              <Ionicons name="location-outline" size={14} color={Colors.light.text} />
              <ThemedText style={styles.locationText} numberOfLines={1}>
                {item.location}
              </ThemedText>
            </View>
          </View>
          
          <View style={styles.metaInfo}>
            <View style={styles.participantsInfo}>
              <Ionicons name="people-outline" size={14} color={Colors.light.text} />
              <ThemedText style={styles.participantsText}>
                {item.participantIds.length}
                {item.maxParticipants ? `/${item.maxParticipants}` : ''} participants
              </ThemedText>
            </View>
          </View>
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
  placeholderImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
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
  dateTimeInfo: {
    marginBottom: 12,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
  footer: {
    marginBottom: 8,
  },
  organizerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  organizerText: {
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
  participantsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participantsText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.6,
  },
});
