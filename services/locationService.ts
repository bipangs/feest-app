import * as Location from 'expo-location';

export interface LocationData {
  latitude: number;
  longitude: number;
  city: string;
  region: string;
  country: string;
  address: string;
  accuracy?: number;
  source?: 'gps' | 'ip';
}

export class LocationService {
  /**
   * Get device GPS location (primary method)
   */
  static async getDeviceLocation(): Promise<LocationData | null> {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission not granted');
        return null;
      }      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced, // Good balance of accuracy and battery
      });

      const { latitude, longitude } = location.coords;

      // Reverse geocode to get address
      try {
        const reverseGeocode = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });

        if (reverseGeocode.length > 0) {
          const place = reverseGeocode[0];
          const city = place.city || place.subregion || '';
          const region = place.region || '';
          const country = place.country || '';
          
          return {
            latitude,
            longitude,
            city,
            region,
            country,
            address: `${city}, ${region}, ${country}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ','),
            accuracy: location.coords.accuracy || undefined,
            source: 'gps'
          };
        }
      } catch (geocodeError) {
        console.log('Reverse geocoding failed, using coordinates only:', geocodeError);
      }

      // If reverse geocoding fails, return coordinates with generic address
      return {
        latitude,
        longitude,
        city: '',
        region: '',
        country: '',
        address: `${this.formatCoordinates(latitude, longitude)}`,
        accuracy: location.coords.accuracy || undefined,
        source: 'gps'
      };

    } catch (error) {
      console.error('Error getting device location:', error);
      return null;
    }
  }

  /**
   * Check if location services are enabled
   */
  static async isLocationEnabled(): Promise<boolean> {
    try {
      return await Location.hasServicesEnabledAsync();
    } catch (error) {
      console.error('Error checking location services:', error);
      return false;
    }
  }

  /**
   * Get location from IP address using a free IP geolocation service
   */
  static async getLocationFromIP(): Promise<LocationData | null> {
    try {
      // Using ipapi.co service (free tier allows 1000 requests per day)
      const response = await fetch('https://ipapi.co/json/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'IP location service error');
      }
        return {
        latitude: parseFloat(data.latitude),
        longitude: parseFloat(data.longitude),
        city: data.city || '',
        region: data.region || '',
        country: data.country_name || '',
        address: `${data.city || ''}, ${data.region || ''}, ${data.country_name || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ','),
        source: 'ip'
      };
    } catch (error) {
      console.error('Error getting location from IP:', error);
      return null;
    }
  }

  /**
   * Fallback method using a different IP geolocation service
   */
  static async getLocationFromIPFallback(): Promise<LocationData | null> {
    try {
      // Using ip-api.com as fallback (free tier allows 1000 requests per month)
      const response = await fetch('http://ip-api.com/json/');
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data from fallback service');
      }
      
      const data = await response.json();
      
      if (data.status === 'fail') {
        throw new Error(data.message || 'IP location service error');
      }
        return {
        latitude: data.lat,
        longitude: data.lon,
        city: data.city || '',
        region: data.regionName || '',
        country: data.country || '',
        address: `${data.city || ''}, ${data.regionName || ''}, ${data.country || ''}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ','),
        source: 'ip'
      };
    } catch (error) {
      console.error('Error getting location from IP (fallback):', error);
      return null;
    }
  }
  /**
   * Get location with automatic source priority (GPS -> IP fallback)
   */
  static async getLocationAuto(): Promise<LocationData | null> {
    // First, try device GPS location
    console.log('Attempting GPS location...');
    let location = await this.getDeviceLocation();
    
    if (location) {
      console.log('GPS location successful');
      return location;
    }

    // If GPS fails, fall back to IP location
    console.log('GPS failed, trying IP location...');
    location = await this.getLocationFromIP();
    
    if (!location) {
      console.log('Primary IP location service failed, trying fallback...');
      location = await this.getLocationFromIPFallback();
    }
    
    return location;
  }

  /**
   * Get location with IP only (for cases where GPS is not desired)
   */
  static async getLocationIPOnly(): Promise<LocationData | null> {
    let location = await this.getLocationFromIP();
    
    if (!location) {
      console.log('Primary IP location service failed, trying fallback...');
      location = await this.getLocationFromIPFallback();
    }
    
    return location;
  }

  /**
   * Format coordinates for display
   */
  static formatCoordinates(latitude: number, longitude: number): string {
    const latDirection = latitude >= 0 ? 'N' : 'S';
    const lonDirection = longitude >= 0 ? 'E' : 'W';
    
    return `${Math.abs(latitude).toFixed(4)}°${latDirection}, ${Math.abs(longitude).toFixed(4)}°${lonDirection}`;
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in kilometers
   */
  static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  /**
   * Get nearest items from a list based on user location
   */
  static getNearestItems<T extends { latitude?: number; longitude?: number }>(
    items: T[],
    userLocation: { latitude: number; longitude: number },
    maxDistance: number = 50 // kilometers
  ): (T & { distance: number })[] {
    return items
      .filter(item => item.latitude !== undefined && item.longitude !== undefined)
      .map(item => ({
        ...item,
        distance: this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          item.latitude!,
          item.longitude!
        )
      }))
      .filter(item => item.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance);
  }

  /**
   * Format distance for display
   */
  static formatDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    } else {
      return `${distance.toFixed(1)}km`;
    }
  }

  /**
   * Get location coordinates from IP address
   */
  static async getLocationFromSpecificIP(ipAddress: string): Promise<LocationData | null> {
    try {
      const response = await fetch(`https://ipapi.co/${ipAddress}/json/`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch location data for IP');
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.reason || 'Invalid IP address');
      }
      
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        city: data.city || '',
        region: data.region || '',
        country: data.country_name || '',
        address: `${data.city}, ${data.region}, ${data.country_name}`.replace(/^,\s*|,\s*$/g, '').replace(/,\s*,/g, ','),
        source: 'ip'
      };
    } catch (error) {
      console.error('Error getting location from IP:', error);
      return null;
    }
  }

  /**
   * Resolve location for food items that have IP addresses
   */
  static async resolveFoodItemLocations<T extends { locationIP?: string; latitude?: number; longitude?: number }>(
    items: T[]
  ): Promise<(T & { resolvedLocation?: LocationData })[]> {
    const resolvedItems = await Promise.all(
      items.map(async (item) => {
        // If already has coordinates, use them
        if (item.latitude && item.longitude) {
          return item;
        }
        
        // Try to resolve from IP
        if (item.locationIP) {
          const locationData = await this.getLocationFromSpecificIP(item.locationIP);
          if (locationData) {
            return {
              ...item,
              latitude: locationData.latitude,
              longitude: locationData.longitude,
              resolvedLocation: locationData,
            };
          }
        }
        
        return item;
      })
    );
    
    return resolvedItems;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
