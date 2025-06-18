# Food Swap Transaction System - Database Collections Setup

## ⚠️ IMPORTANT: Collection Creation Required

The transaction system requires a `transactions` collection in your Appwrite database. If the request button does nothing, this collection likely doesn't exist yet.

## Quick Setup Steps

### 1. Create Transactions Collection in Appwrite Console

1. Open your Appwrite Console: https://syd.cloud.appwrite.io/console
2. Go to your `feest` project
3. Navigate to **Database** → **feest** database
4. Click **"Create Collection"**
5. Set Collection ID: `transactions`
6. Set Collection Name: `Transactions`

### 2. Add Required Attributes

Create these attributes in the `transactions` collection:

**String Attributes:**
- `foodItemId` (String, Required, Size: 255)
- `foodTitle` (String, Required, Size: 255) 
- `ownerId` (String, Required, Size: 255)
- `ownerName` (String, Required, Size: 255)
- `requesterId` (String, Required, Size: 255)
- `requesterName` (String, Required, Size: 255)
- `chatRoomId` (String, Optional, Size: 255)
- `status` (String, Required, Size: 50, Default: "pending")
- `requestMessage` (String, Optional, Size: 1000)
- `completionPhoto` (String, Optional, Size: 500)

**DateTime Attributes:**
- `requestedDate` (DateTime, Required)
- `acceptedDate` (DateTime, Optional)
- `completedDate` (DateTime, Optional)
- `chatExpiresAt` (DateTime, Optional)
- `createdAt` (DateTime, Required)
- `updatedAt` (DateTime, Required)

### 3. Set Permissions

**Read Access:**
- Users (authenticated users can read their own transactions)

**Write Access:**
- Users (authenticated users can create/update their own transactions)

### 4. Create Indexes (Optional but Recommended)

- `ownerId` (single attribute index)
- `requesterId` (single attribute index)  
- `foodItemId` (single attribute index)
- `status` (single attribute index)

## Quick Test

After creating the collection, test the request button:

1. Go to a food item you don't own
2. Press "Request Swap"
3. Check the console logs for debugging info
4. If successful, check your transactions tab

## Troubleshooting

**If the button still doesn't work:**

1. **Check Console Logs** - Look for error messages in the developer console
2. **Verify Collection ID** - Make sure you used exactly `transactions` as the Collection ID
3. **Check Permissions** - Ensure authenticated users have read/write access
4. **Check Database ID** - Verify you're using the correct database (`685060470025155bac52`)

**Common Error Messages:**
- `Collection with the requested ID could not be found` → Collection doesn't exist
- `Document with the requested ID could not be found` → Permission issue
- `The current user is not authorized` → Permission issue

## Database Schema Details

### 1. Transactions Collection
**Collection ID**: `transactions`

**Attributes**:
- `foodItemId` (String, Required) - Reference to food item
- `foodTitle` (String, Required) - Cached food title
- `ownerId` (String, Required) - Food owner's user ID
- `ownerName` (String, Required) - Cached owner name
- `requesterId` (String, Required) - Requester's user ID  
- `requesterName` (String, Required) - Cached requester name
- `chatRoomId` (String, Optional) - Associated chat room
- `status` (String, Required, Default: "pending") - Transaction status
- `requestMessage` (String, Optional) - Initial request message
- `completionPhoto` (String, Optional) - Completion proof photo
- `requestedDate` (DateTime, Required) - When request was made
- `acceptedDate` (DateTime, Optional) - When request was accepted
- `completedDate` (DateTime, Optional) - When transaction completed
- `chatExpiresAt` (DateTime, Optional) - When chat expires (3 hours after completion)
- `createdAt` (DateTime, Required) - Document creation time
- `updatedAt` (DateTime, Required) - Last update time

**Indexes**:
- `ownerId_status` (compound) - For owner's pending requests
- `requesterId_status` (compound) - For requester's transactions  
- `foodItemId` (single) - For food item transactions
- `status_chatExpiresAt` (compound) - For cleanup expired chats
- `createdAt` (single, descending) - For chronological ordering

**Permissions**:
- Read: Users can read transactions they're involved in
- Write: Users can create/update transactions they're involved in

### 2. Transaction Messages Collection (Optional - for future)
**Collection ID**: `transaction-messages`

**Attributes**:
- `transactionId` (String, Required) - Reference to transaction
- `senderId` (String, Required) - Message sender ID
- `senderName` (String, Required) - Cached sender name
- `message` (String, Required) - Message content
- `messageType` (String, Required) - Message type (text/image/system)
- `timestamp` (DateTime, Required) - Message timestamp

### 3. Completion Proofs Collection (Optional - for future)
**Collection ID**: `completion-proofs`

**Attributes**:
- `transactionId` (String, Required) - Reference to transaction
- `photoUri` (String, Required) - Photo proof URI
- `takenAt` (DateTime, Required) - When photo was taken
- `uploadedBy` (String, Required) - Who uploaded the proof

## Transaction Status Flow

1. **pending** - Initial request sent, waiting for owner response
2. **accepted** - Owner accepted, chat room created
3. **in_progress** - Transaction in progress (same as accepted)
4. **completed** - Owner completed transaction with photo proof
5. **cancelled** - Request rejected or transaction cancelled

## Chat Room Lifecycle

1. **Creation**: Chat room created when transaction is accepted
2. **Active Phase**: Used for coordination between owner and requester
3. **Completion**: Transaction marked complete, 3-hour countdown starts
4. **Cleanup**: Chat room automatically deleted after 3 hours

## API Flow Summary

### Food Request Process:
1. User presses "Request Swap" button
2. `FoodService.createFoodSwapRequest()` creates transaction
3. Transaction appears in owner's notifications (transactions tab)
4. Owner can accept/reject from transactions tab

### Acceptance Process:
1. Owner accepts request
2. `TransactionService.acceptTransaction()` updates status
3. Chat room created automatically
4. Food item status changes to "requested"
5. Both parties can access chat for coordination

### Completion Process:
1. Owner completes swap and takes photo
2. `TransactionService.completeTransaction()` called
3. Chat shows completion message with 3-hour timer
4. Food item status changes to "completed"
5. Chat automatically deleted after 3 hours

### Cleanup Process:
1. `TransactionService.initialize()` sets up periodic cleanup
2. `TransactionService.cleanupExpiredChats()` runs hourly
3. Expired chats deleted automatically
4. Transaction updated to remove chat reference

This system provides a complete end-to-end food swap workflow with proper notifications, chat integration, and automatic cleanup.
