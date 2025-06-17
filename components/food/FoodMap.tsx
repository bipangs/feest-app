import { Colors } from '@/constants/Colors';
import { FoodItem } from '@/types/food';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

interface FoodMapProps {
  foodItems: FoodItem[];
  selectedFoodId?: string;
  onMarkerPress?: (foodItem: FoodItem) => void;
  style?: any;
}

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

export const FoodMap: React.FC<FoodMapProps> = ({
  foodItems,
  selectedFoodId,
  onMarkerPress,
  style
}) => {
  // Filter items that have location coordinates
  const itemsWithLocation = foodItems.filter(
    item => item.latitude && item.longitude
  );

  // Calculate initial region based on food items
  const getInitialRegion = () => {
    if (itemsWithLocation.length === 0) {
      // Default to a general location if no items with coordinates
      return {
        latitude: 37.78825,
        longitude: -122.4324,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
    }

    if (itemsWithLocation.length === 1) {
      const item = itemsWithLocation[0];
      return {
        latitude: item.latitude!,
        longitude: item.longitude!,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };
    }

    // Calculate bounds for multiple items
    const latitudes = itemsWithLocation.map(item => item.latitude!);
    const longitudes = itemsWithLocation.map(item => item.longitude!);
    
    const minLat = Math.min(...latitudes);
    const maxLat = Math.max(...latitudes);
    const minLon = Math.min(...longitudes);
    const maxLon = Math.max(...longitudes);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLon = (minLon + maxLon) / 2;
    
    const latDelta = Math.max(maxLat - minLat, LATITUDE_DELTA);
    const lonDelta = Math.max(maxLon - minLon, LONGITUDE_DELTA);
    
    return {
      latitude: centerLat,
      longitude: centerLon,
      latitudeDelta: latDelta * 1.2, // Add some padding
      longitudeDelta: lonDelta * 1.2,
    };
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

  if (itemsWithLocation.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No food items with location data</Text>
          <Text style={styles.emptyStateSubtext}>
            Food items will appear here once location is detected
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={getInitialRegion()}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
      >
        {itemsWithLocation.map((item) => (
          <Marker
            key={item.$id}
            coordinate={{
              latitude: item.latitude!,
              longitude: item.longitude!,
            }}
            title={item.title}
            description={`${getCategoryEmoji(item.category)} ${item.description}`}
            onPress={() => onMarkerPress?.(item)}
          >
            <View style={[
              styles.markerContainer,
              selectedFoodId === item.$id && styles.selectedMarker
            ]}>
              <Text style={styles.markerEmoji}>
                {getCategoryEmoji(item.category)}
              </Text>
            </View>
          </Marker>
        ))}
      </MapView>
      
      <View style={styles.legend}>
        <Text style={styles.legendText}>
          {itemsWithLocation.length} food item{itemsWithLocation.length !== 1 ? 's' : ''} shown
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  map: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.tabIconDefault,
    textAlign: 'center',
  },
  markerContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: Colors.light.tint,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedMarker: {
    borderColor: '#FF6B35',
    backgroundColor: '#FFF5F3',
  },
  markerEmoji: {
    fontSize: 16,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  legendText: {
    fontSize: 14,
    color: Colors.light.text,
    fontWeight: '500',
  },
});
