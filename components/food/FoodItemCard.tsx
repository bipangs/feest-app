import { FoodSwapRequestButton } from '@/components/food/FoodSwapRequestButton';
import { AuthenticatedImage } from '@/components/ui/AuthenticatedImage';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { FoodService } from '@/services/foodService';
import { FoodItem } from '@/types/food';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface FoodItemCardProps {
  item: FoodItem;
  onPress?: () => void;
  onRefresh?: () => void;
  showActions?: boolean;
}

export const FoodItemCard: React.FC<FoodItemCardProps> = ({
  item,
  onPress,
  onRefresh,
  showActions = true,
}) => {  const { user } = useAuth();
  const [imageLoadError, setImageLoadError] = useState(false);
  const isOwner = user?.$id === item.ownerId;

  const getStatusColor = (status: FoodItem['status']) => {
    switch (status) {
      case 'available':
        return '#10B981';
      case 'requested':
        return '#F59E0B';
      case 'completed':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: FoodItem['status']) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'requested':
        return 'Requested';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getCategoryEmoji = (category?: string) => {
    switch (category) {
      case 'fruits': return '🍎';
      case 'vegetables': return '🥕';
      case 'grains': return '🌾';
      case 'dairy': return '🥛';
      case 'meat': return '🥩';
      case 'baked-goods': return '🍞';
      case 'prepared-meals': return '🍽️';
      case 'beverages': return '🥤';
      default: return '📦';
    }
  };
  const formatDate = (date: Date) => {
    try {
      const today = new Date();
      const diffTime = date.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return `Expired ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago`;
      } else if (diffDays === 0) {
        return 'Expires today';
      } else if (diffDays === 1) {
        return 'Expires tomorrow';
      } else {
        return `Expires in ${diffDays} days`;
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Date unavailable';
    }
  };  const handleMarkComplete = async () => {
    Alert.alert(
      'Mark as Complete',
      'Are you sure you want to mark this item as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              await FoodService.updateFoodItemStatus(item.$id!, 'completed');
              Alert.alert('Success', 'Item marked as completed!');
              onRefresh?.();
            } catch (error) {
              console.error('Error updating status:', error);
              Alert.alert('Error', 'Failed to update status. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Food Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await FoodService.deleteFoodItem(item.$id!);
              Alert.alert('Success', 'Item deleted successfully!');
              onRefresh?.();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item. Please try again.');
            }
          },
        },
      ]
    );
  };
  const isExpiringSoon = () => {
    if (!item.expiryDate) return false;
    const today = new Date();
    const diffTime = item.expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  const isExpired = () => {
    if (!item.expiryDate) return false;
    const today = new Date();
    return item.expiryDate.getTime() < today.getTime();
  };return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>        {item.imageUri && !imageLoadError ? (
          <AuthenticatedImage 
            uri={item.imageUri}
            style={styles.image}
            onError={(error) => {
              console.error('Error loading image:', error?.nativeEvent?.error || 'Unknown error');
              setImageLoadError(true);
            }}
            placeholder={
              <View style={[styles.image, styles.placeholderImage]}>
                <Ionicons name="image" size={40} color="#ccc" />
                <Text style={styles.placeholderText}>Image unavailable</Text>
              </View>
            }
          />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <Ionicons name="image" size={40} color="#ccc" />
            <Text style={styles.placeholderText}>
              {imageLoadError ? 'Image unavailable' : 'No image'}
            </Text>
          </View>
        )}
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
        {(isExpired() || isExpiringSoon()) && (
          <View style={[styles.expiryBadge, { backgroundColor: isExpired() ? '#EF4444' : '#F59E0B' }]}>
            <Ionicons name="warning" size={12} color="white" />
          </View>
        )}
      </View>

      <View style={styles.content}>        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {getCategoryEmoji(item.category)} {item.title || 'Untitled'}
          </Text>
          <View style={styles.ownerInfo}>
            <Text style={styles.owner}>by {item.ownerName || 'Unknown'}</Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description || 'No description available'}
        </Text>

        <View style={styles.details}>
          <View style={styles.detailItem}>
            <Ionicons name="calendar" size={14} color={Colors.light.tabIconDefault} />            <Text style={[
              styles.detailText,
              isExpired() && styles.expiredText,
              isExpiringSoon() && styles.expiringSoonText,
            ]}>
              {item.expiryDate ? formatDate(item.expiryDate) : 'No expiry date'}
            </Text>
          </View>
          {item.location && (
            <View style={styles.detailItem}>
              <Ionicons name="location" size={14} color={Colors.light.tabIconDefault} />
              <Text style={styles.detailText}>{item.location}</Text>
            </View>
          )}
        </View>        {showActions && (
          <View style={styles.actions}>
            {!isOwner && item.status === 'available' && (
              <FoodSwapRequestButton 
                foodItem={item}
                onRequestSent={onRefresh}
              />
            )}
            
            {isOwner && (
              <View style={styles.ownerActions}>
                {item.status === 'requested' && (
                  <TouchableOpacity style={styles.completeButton} onPress={handleMarkComplete}>
                    <Ionicons name="checkmark" size={16} color="white" />
                    <Text style={styles.completeButtonText}>Complete</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                  <Ionicons name="trash" size={16} color="white" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    position: 'relative',
  },  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },  placeholderImage: {
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  expiryBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,  },
  header: {
    marginBottom: 8,
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  owner: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
  },
  description: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  details: {
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    marginLeft: 6,
  },
  expiredText: {
    color: '#EF4444',
    fontWeight: '600',
  },
  expiringSoonText: {
    color: '#F59E0B',
    fontWeight: '600',
  },  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ownerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  completeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  deleteButton: {
    backgroundColor: '#EF4444',
    padding: 8,
    borderRadius: 20,
  },
});
