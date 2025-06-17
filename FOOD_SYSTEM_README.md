# Food Sharing System Documentation

## Overview
The Food Sharing Platform allows users to share available food items with their community, helping reduce food waste while providing food access to those in need.

## Features Implemented

### 🍎 Food Management
- **Add Food Items**: Users can create food listings with photos taken directly from the app camera
- **Food Categories**: Support for fruits, vegetables, grains, dairy, meat, baked goods, prepared meals, beverages, and other
- **Expiry Date Tracking**: Visual indicators for foods that are expiring soon or have expired
- **Status Management**: Automatic status tracking (available → requested → completed)

### 📸 Camera Integration
- **In-App Camera**: Take photos directly within the app for food items
- **Gallery Access**: Option to select existing photos from device gallery
- **Image Upload**: Seamless integration with Appwrite storage for image hosting

### 🔍 Food Discovery
- **Browse All Items**: View all available food items in the community
- **Filter by Availability**: Show only currently available items
- **My Items**: View and manage your own food listings
- **Real-time Status**: Live updates when items are requested or completed

### 📱 User Interface
- **Modern Design**: Clean, intuitive interface with visual status indicators
- **Visual Warnings**: Color-coded alerts for expiring/expired items
- **Refresh Support**: Pull-to-refresh functionality for real-time updates
- **Responsive Layout**: Optimized for mobile devices

## Technical Implementation

### Architecture
- **Frontend**: React Native with Expo
- **Backend**: Appwrite (Database + Storage)
- **State Management**: React hooks with custom food management hooks
- **Navigation**: Expo Router with tab-based navigation

### Key Components

#### 1. FoodService (`services/foodService.ts`)
Handles all backend operations:
- Create/read/update/delete food items
- Image upload to Appwrite storage
- Food request management
- Status updates

#### 2. Food Components (`components/food/`)
- **FoodScreen**: Main interface for browsing and filtering food items
- **AddFoodForm**: Complete form for adding new food items
- **FoodItemCard**: Reusable card component for displaying food items
- **FoodCamera**: Camera interface for taking food photos

#### 3. Custom Hooks (`hooks/useFoodItems.ts`)
- **useFoodItems**: Manage all food items with filtering
- **useUserFoodItems**: Manage user's own food items
- **useFoodRequests**: Handle food requests

### Database Schema

#### Food Items Collection
```typescript
interface FoodItem {
  $id: string;
  title: string;
  description: string;
  imageUri: string;
  expiryDate: Date;
  status: 'available' | 'requested' | 'completed';
  ownerId: string;
  ownerName: string;
  location?: string;
  category?: FoodCategory;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Food Requests Collection
```typescript
interface FoodRequest {
  $id: string;
  foodItemId: string;
  requesterId: string;
  requesterName: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}
```

## User Workflow

### Adding Food Items
1. User taps the "+" button in the main food screen
2. Takes a photo using the in-app camera or selects from gallery
3. Fills in food details (title, description, expiry date, category, location)
4. Submits the form
5. Food item is created with "available" status

### Requesting Food
1. User browses available food items
2. Taps "Request" on desired item
3. Optionally adds a message
4. Request is sent to food owner
5. Item status changes to "requested"

### Managing Food Items
- **Food Owners**: Can mark items as completed or delete them
- **Status Tracking**: Visual indicators show current status
- **Expiry Warnings**: Items show warnings when expiring soon or expired

## Security & Permissions

### Camera Permissions
- App requests camera permissions when user first attempts to take a photo
- Graceful fallback to gallery if camera permission denied

### Data Security
- All food items linked to authenticated users
- Users can only modify their own food items
- Secure image upload to Appwrite storage

## Future Enhancements (Ready for Implementation)

### Real-time Chat System
The foundation is in place to add:
- Direct messaging between food owners and requesters
- Real-time notifications for requests and messages
- Chat history for coordination

### Additional Features
- Location-based filtering using device GPS
- Push notifications for new items and requests
- Rating system for users
- Food waste statistics and gamification

## Setup Requirements

### Dependencies Installed
```json
{
  "expo-camera": "^14.1.0",
  "expo-image-picker": "^14.1.0", 
  "expo-permissions": "^13.2.0",
  "@react-native-community/datetimepicker": "^7.6.0"
}
```

### Appwrite Configuration
The app is configured to work with Appwrite backend:
- Database: `feest-db`
- Collections: `food-items`, `food-requests`
- Storage: `food-images` bucket

## Testing the App

1. **Start the development server**: `npm start`
2. **Login/Register**: Use the authentication system
3. **Add Food Item**: Tap the + button and follow the form
4. **Browse Items**: Use the filter buttons to view different categories
5. **Request Food**: Tap "Request" on available items
6. **Manage Items**: View and manage your own food listings

The food sharing system is now fully functional and ready for users to start sharing food and reducing waste! 🎉
