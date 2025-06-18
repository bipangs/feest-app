# Food Swap Chat Room System

This document describes the new automated chat room creation system for food swap requests in the Feest app.

## Overview

The food swap system now includes an automated notification and chat room creation workflow that streamlines the process of requesting and coordinating food swaps between users.

## How It Works

### 1. Food Swap Request Flow

```
User sees available food item → Requests swap → Owner receives notification → Owner responds
```

### 2. Possible Outcomes

#### If Owner Accepts:
- ✅ Chat room is automatically created
- 📱 Both users are added as participants
- 📝 Food item status changes to "requested"
- 💬 Initial system message explaining the swap request

#### If Owner Rejects:
- ❌ No chat room is created
- 📝 Food item remains "available"
- 🔄 Other users can still request the same item

## Technical Implementation

### New Service Methods

#### FoodService
- `createFoodSwapRequest()` - Creates a new swap request
- `respondToFoodSwapRequest()` - Handle accept/reject responses
- `getPendingRequestsForOwner()` - Get requests for food owner
- `getUserSentRequests()` - Get user's sent requests
- `getFoodItem()` - Get single food item by ID
- `updateFoodItemStatus()` - Update food item status

#### ChatService
- `createFoodSwapChatRoom()` - Create specialized food swap chat room

### New Components

#### Request Components
- `FoodSwapRequestButton` - Button to initiate food swap requests
- `FoodSwapRequestNotification` - Display pending requests for food owners
- `NotificationsScreen` - Screen to manage all pending requests

#### Demo Components
- `FoodSwapDemoScreen` - Comprehensive demo of the entire system

### Updated Types

#### ChatRoom Interface
```typescript
interface ChatRoom {
  // ...existing fields...
  foodItemId?: string; // Reference to food item if this is a swap chat
  chatType?: 'general' | 'food_swap'; // Type of chat room
}
```

## Usage Examples

### 1. Requesting a Food Swap

```tsx
import { FoodSwapRequestButton } from '@/components/food';

<FoodSwapRequestButton
  foodItem={foodItem}
  onRequestSent={() => refreshData()}
/>
```

### 2. Displaying Notifications

```tsx
import { NotificationsScreen } from '@/components/notifications';

<NotificationsScreen />
```

### 3. Handling Requests

```tsx
import { FoodSwapRequestNotification } from '@/components/notifications';

<FoodSwapRequestNotification
  request={request}
  onResponse={(requestId, accepted, chatRoomId) => {
    // Handle response
    if (accepted && chatRoomId) {
      navigation.navigate('Chat', { roomId: chatRoomId });
    }
  }}
/>
```

## User Experience Flow

### For Requesters:

1. **Browse Available Food**: See all available food items
2. **Request Swap**: Tap "Request Swap" button
3. **Add Message**: Optional message to food owner
4. **Wait for Response**: See request status in their sent requests
5. **If Accepted**: Automatically get access to chat room for coordination

### For Food Owners:

1. **Receive Notification**: See pending requests in notifications screen
2. **Review Request**: View requester details and message
3. **Respond**: Accept or reject with optional response message
4. **If Accepted**: Automatically get chat room created for coordination

## Database Collections

### Food Requests Collection (Enhanced)
```typescript
{
  $id: string;
  foodItemId: string;
  requesterId: string;
  requesterName: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}
```

### Chat Rooms Collection (Enhanced)
```typescript
{
  $id: string;
  name: string;
  description?: string;
  createdBy: string;
  createdByName: string;
  participants: string[];
  participantNames: string[];
  isPrivate: boolean;
  lastMessage?: string;
  lastMessageTime?: Date;
  foodItemId?: string; // NEW: Reference to food item
  chatType?: 'general' | 'food_swap'; // NEW: Chat type
  createdAt: Date;
  updatedAt: Date;
}
```

## Benefits

### Automated Workflow
- No manual chat room creation needed
- Automatic participant management
- Streamlined user experience

### Clear Communication
- System messages explain the context
- Optional custom messages from both parties
- Clear request/response flow

### Status Management
- Food items automatically marked as "requested"
- Clear tracking of request states
- Prevention of duplicate requests

### User Control
- Food owners have full control over requests
- Optional messages for personalization
- Easy accept/reject process

## Future Enhancements

### Potential Features
- **Request Expiration**: Auto-expire old requests
- **Multiple Requests**: Allow multiple pending requests per item
- **Request History**: Track all past requests and responses
- **Push Notifications**: Real-time notifications for requests
- **Request Templates**: Pre-written message templates
- **Swap Completion**: Mark swaps as completed in chat

### Integration Opportunities
- **Calendar Integration**: Schedule swap meetups
- **Location Sharing**: Share meetup locations in chat
- **Photo Verification**: Upload completion photos
- **Rating System**: Rate swap experiences

## Error Handling

The system includes comprehensive error handling for:
- Authentication failures
- Network connectivity issues
- Database operation failures
- Invalid request states
- Permission verification

All errors are displayed to users with clear, actionable messages.

## Testing

### Manual Testing Checklist
- [ ] Request swap for available food item
- [ ] Try requesting own food item (should be blocked)
- [ ] Try requesting already requested item (should be blocked)
- [ ] Accept request and verify chat room creation
- [ ] Reject request and verify no chat room created
- [ ] Verify food status updates correctly
- [ ] Test with multiple pending requests
- [ ] Test error scenarios (network issues, etc.)

### Integration Points
- Authentication system
- Food item management
- Chat system
- Notification system
- User profile management

This system provides a seamless, automated way to handle food swap requests while maintaining user control and clear communication throughout the process.
