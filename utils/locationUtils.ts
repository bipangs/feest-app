import { LocationService } from '@/services/locationService';
import { FoodItem } from '@/types/food';

/**
 * Utility functions for handling location-based operations
 */
export class LocationUtils {
  /**
   * Process food items to ensure they have coordinates from IP addresses
   */
  static async processFoodItemLocations(items: FoodItem[]): Promise<FoodItem[]> {
    const processedItems = await Promise.all(
      items.map(async (item) => {
        // If already has coordinates, return as is
        if (item.latitude && item.longitude) {
          return item;
        }

        // Try to resolve location from IP
        if (item.locationIP) {
          try {
            const locationData = await LocationService.getLocationFromSpecificIP(item.locationIP);
            if (locationData) {
              return {
                ...item,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
                location: item.location || locationData.address,
              };
            }
          } catch (error) {
            console.warn(`Failed to resolve location for IP ${item.locationIP}:`, error);
          }
        }

        return item;
      })
    );

    return processedItems;
  }

  /**
   * Get nearest items with automatic IP resolution
   */
  static async getNearestFoodItems(
    items: FoodItem[],
    userLocation: { latitude: number; longitude: number },
    maxDistance: number = 20
  ): Promise<(FoodItem & { distance: number })[]> {
    // First, ensure all items have coordinates
    const processedItems = await this.processFoodItemLocations(items);
    
    // Then use the standard nearest items function
    return LocationService.getNearestItems(processedItems, userLocation, maxDistance);
  }

  /**
   * Batch resolve multiple IP addresses for better performance
   */
  static async batchResolveIPs(ipAddresses: string[]): Promise<Map<string, { latitude: number; longitude: number }>> {
    const resolutionMap = new Map();
    
    // Process IPs in batches to avoid rate limiting
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < ipAddresses.length; i += batchSize) {
      batches.push(ipAddresses.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const batchPromises = batch.map(async (ip) => {
        try {
          const location = await LocationService.getLocationFromSpecificIP(ip);
          if (location) {
            resolutionMap.set(ip, {
              latitude: location.latitude,
              longitude: location.longitude,
            });
          }
        } catch (error) {
          console.warn(`Failed to resolve IP ${ip}:`, error);
        }
      });

      await Promise.all(batchPromises);
      
      // Add a small delay between batches to respect API rate limits
      if (batches.indexOf(batch) < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    return resolutionMap;
  }

  /**
   * Validate if an IP address format is valid
   */
  static isValidIP(ip: string): boolean {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
    
    return ipv4Regex.test(ip) || ipv6Regex.test(ip);
  }
}
