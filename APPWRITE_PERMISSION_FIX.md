# URGENT: Fix Appwrite Collection Permissions

## Problem
The food swap request is failing with an authorization error when trying to create notifications. This indicates that the `notification` collection in Appwrite doesn't have proper permissions set for authenticated users.

## Solution: Update Appwrite Collection Permissions

### 1. Go to Appwrite Console
Navigate to: https://cloud.appwrite.io/console/project-feest/databases/database-685060470025155bac52

### 2. Find the `notification` Collection
- Click on the `notification` collection
- Go to the "Settings" tab
- Look for "Permissions" section

### 3. Update Permissions
Set the following permissions for the `notification` collection:

**Read Permissions:**
- Add: `users` (Any authenticated user can read)
- Or more specifically: `user:*` (any authenticated user)

**Create Permissions:**
- Add: `users` (Any authenticated user can create)
- Or more specifically: `user:*` (any authenticated user)

**Update Permissions:**
- Add: `users` (Any authenticated user can update)
- Or more specifically: `user:*` (any authenticated user)

**Delete Permissions:**
- Add: `users` (Any authenticated user can delete their own)
- Or more specifically: `user:*` (any authenticated user)

### 4. Alternative: Document-Level Permissions
If you prefer more granular control, you can set permissions at the document level:
- Set read/write permissions to the document creator: `user:{userId}`
- Set read permissions to the target user: `user:{toUserId}`

### 5. Verify the Fix
After updating permissions:
1. Save the changes in Appwrite console
2. Try the food swap request again in the app
3. The notification should be created successfully

## Current Error Details
```
ERROR: The current user is not authorized to perform the requested action.
Location: NotificationService.createNotification()
User: iv@iv.iv (authenticated)
Action: Creating notification for food swap request
Target: notification collection
```

## Next Steps
1. **Immediate**: Update Appwrite permissions as described above
2. **Testing**: Verify food swap requests work after permission changes
3. **Monitoring**: Check that other notification operations work correctly

## Code Context
The error occurs in `services/notificationService.ts` when calling:
```typescript
const document = await databases.createDocument(
  DATABASE_ID,
  NOTIFICATION_COLLECTION_ID,
  ID.unique(),
  notificationData
);
```

The user is authenticated (session valid), but the collection permissions are restricting document creation.
