# Food Swap Request Authorization Error - Troubleshooting Guide

## Current Issue
```
ERROR: The current user is not authorized to perform the requested action.
```

This error occurs when user "iv@iv.iv" tries to request food from user "aurin". The issue is with Appwrite collection permissions.

## Quick Fix Steps

### Step 1: Check Appwrite Console
1. Go to: https://cloud.appwrite.io/console/project-feest/databases/database-685060470025155bac52
2. Click on the `notification` collection
3. Go to "Settings" tab → "Permissions" section

### Step 2: Update Collection Permissions
Set these permissions for the `notification` collection:

**For "Any authenticated user" access:**
- **Read**: `users`
- **Create**: `users` 
- **Update**: `users`
- **Delete**: `users`

**Alternative - More specific permissions:**
- **Read**: `user:*`
- **Create**: `user:*`
- **Update**: `user:*` 
- **Delete**: `user:*`

### Step 3: Save and Test
1. Click "Save" in Appwrite console
2. Try the food swap request again in the app
3. Should work without authorization errors

## Testing the Fix

Add this debug code to test permissions (temporary):

```typescript
import { NotificationService } from '@/services/notificationService';

// Test permissions
await NotificationService.checkCollectionPermissions();
```

## Alternative Solutions

### Option 1: Document-Level Permissions
If collection-level permissions don't work, try document-level permissions:
- Set `user:{fromUserId}` and `user:{toUserId}` on each notification document

### Option 2: Check User Authentication
Verify the user session is valid:
```typescript
// In your component
const checkAuth = async () => {
  const { account } = await import('react-native-appwrite');
  try {
    const user = await account.get();
    console.log('User authenticated:', user.email);
  } catch (error) {
    console.log('Auth error:', error);
  }
};
```

## Understanding the Error Flow

1. **User Action**: "iv@iv.iv" presses on Apple food item
2. **Authentication**: ✅ User session is valid 
3. **Food Item Check**: ✅ Apple belongs to "aurin", status is "available"
4. **Notification Creation**: ❌ Fails with authorization error
5. **Root Cause**: `notification` collection permissions don't allow authenticated users to create documents

## Code Context

The error happens in `NotificationService.createNotification()`:

```typescript
// This line fails with authorization error:
const document = await databases.createDocument(
  DATABASE_ID,
  NOTIFICATION_COLLECTION_ID,  // 'notification'
  ID.unique(),
  notificationData
);
```

## After Fixing

Once permissions are fixed, the flow should be:
1. ✅ User requests Apple
2. ✅ Notification created in database
3. ✅ "aurin" receives notification about the request
4. ✅ "aurin" can accept/reject the request
5. ✅ Transaction is created if accepted

## Verification Commands

After fixing permissions, these should work:
- Creating notifications
- Reading user notifications  
- Updating notification status
- Deleting notifications

The food swap feature will be fully functional after this permission fix.
