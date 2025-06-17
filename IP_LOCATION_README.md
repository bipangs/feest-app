# IP-Based Location Support

The feest app now supports IP-based location resolution for food items stored in Appwrite. This allows the app to determine the approximate location of food items when GPS coordinates are not available.

## How It Works

1. **Food items are stored with IP addresses** in the `locationIP` field
2. **IP addresses are resolved** to latitude/longitude coordinates using the ipapi.co service
3. **Location coordinates are cached** to avoid repeated API calls
4. **Distance calculations** work normally once coordinates are resolved

## Data Structure

### FoodItem Interface
```typescript
interface FoodItem {
  // ... other fields
  location?: string;        // Human-readable address
  locationIP?: string;      // IP address for location lookup
  latitude?: number;        // Resolved from IP or GPS
  longitude?: number;       // Resolved from IP or GPS
}
```

## Usage Examples

### Basic Usage
```typescript
// Food items with IP addresses are automatically resolved
const foodItems = await FoodService.getFoodItemsWithLocation();

// Get nearest items (coordinates resolved from IP)
const nearest = await LocationUtils.getNearestFoodItems(
  foodItems,
  userLocation,
  20 // 20km radius
);
```

### Manual IP Resolution
```typescript
// Resolve a specific IP address
const location = await LocationService.getLocationFromSpecificIP('8.8.8.8');
console.log(location); // { latitude: 37.4056, longitude: -122.0775, ... }

// Batch resolve multiple IPs
const ipMap = await LocationUtils.batchResolveIPs(['8.8.8.8', '1.1.1.1']);
```

### Debug Information
```typescript
// Show debug info in food cards
<FoodHorizontalCard 
  item={foodItem} 
  onPress={handlePress}
  showDebugInfo={__DEV__} // Show in development only
/>
```

## Performance Considerations

- **IP resolution is cached** to avoid repeated API calls
- **Batch processing** is used when resolving multiple IPs
- **Rate limiting** is respected with delays between batches
- **Fallback to mock data** when API is unavailable

## API Limitations

- Uses ipapi.co free tier (1000 requests/day)
- Accuracy depends on IP geolocation database
- Private/local IPs (192.168.x.x) won't resolve to real locations

## Production Setup

For production, consider:
1. **Upgrading to paid IP geolocation service** for higher limits
2. **Caching resolved coordinates** in your database
3. **Using multiple IP geolocation providers** for redundancy

## Testing

Mock data includes sample IP addresses that demonstrate the functionality:
- `192.168.1.100` - Mock local IP (coordinates hardcoded for testing)
- Real IP addresses can be used for actual testing
