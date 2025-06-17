# Location and Map Features Implementation

## Overview
This implementation adds IP-based location detection and map visualization to the food sharing app.

## Features Added

### 1. IP-Based Location Detection
- **Automatic location detection** when adding food items
- **Fallback service** for reliability
- **Manual override** option for users
- **Location coordinates** stored with food items

### 2. Map Visualization
- **Interactive map** showing food item locations
- **Custom markers** with category emojis
- **Toggle between list and map views**
- **Marker selection** for food item details

### 3. Enhanced Food Form
- **Auto-detect location** button
- **Coordinate display** with formatted lat/lng
- **Loading states** for better UX
- **Manual location input** as fallback

## Technical Implementation

### Services
- `LocationService`: Handles IP geolocation using external APIs
  - Primary: ipapi.co (1000 requests/day free)
  - Fallback: ip-api.com (1000 requests/month free)

### Components
- `FoodMap`: Interactive map component with markers
- `AddFoodForm`: Enhanced with location detection
- `FoodScreen`: Toggle between list/map views

### Data Structure
Updated `FoodItem` type to include:
```typescript
interface FoodItem {
  // ... existing fields
  latitude?: number;
  longitude?: number;
}
```

## Setup Requirements

### 1. Package Dependencies
```bash
npm install react-native-maps expo-location
```

### 2. App Configuration (app.json)
```json
{
  "expo": {
    "plugins": ["expo-location"],
    "android": {
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "INTERNET"
      ],
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

### 3. Google Maps API Keys (Optional)
While the map will work without API keys in development, for production you should:
1. Get Google Maps API keys from Google Cloud Console
2. Replace placeholders in app.json with actual keys
3. Enable required APIs (Maps SDK for Android/iOS)

## Usage

### For Users
1. **Adding Food Items**: Location is automatically detected when opening the add food form
2. **Viewing Map**: Use the map toggle button in the food screen header
3. **Manual Location**: Users can edit the detected location if needed

### For Developers
1. **Location Service**: Use `LocationService.getLocationAuto()` for automatic detection
2. **Map Component**: Use `<FoodMap foodItems={items} />` to display items on map
3. **Coordinates**: Access via `item.latitude` and `item.longitude`

## Error Handling
- Graceful fallback when location detection fails
- User alerts for location errors
- Manual location input as backup
- Map shows empty state when no location data

## Privacy Considerations
- IP-based location is approximate (city-level accuracy)
- No device GPS required
- Users can manually edit location
- Location sharing is optional

## Future Enhancements
- Device GPS location as primary source
- Location accuracy improvements
- Clustering for dense areas
- Distance-based filtering
- Real-time location updates
