/*
 * ================================================================================================
 * MISSING APPWRITE COLLECTIONS - SETUP GUIDE
 * ================================================================================================
 * 
 * ERROR: "collection with requested id cannot be found"
 * CAUSE: The following collections don't exist in your Appwrite database yet
 * 
 * MISSING COLLECTIONS:
 * 1. food-swap-notifications
 * 2. notification-history
 * 
 * ================================================================================================
 * STEP-BY-STEP CREATION INSTRUCTIONS:
 * ================================================================================================
 * 
 * 1. Go to Appwrite Console: https://cloud.appwrite.io/console/project-feest/databases/database-685060470025155bac52
 * 
 * 2. CREATE COLLECTION: food-swap-notifications
 *    - Click "Create Collection"
 *    - Collection ID: food-swap-notifications
 *    - Collection Name: Food Swap Notifications
 *    - Permissions: 
 *      * Read: Any authenticated user
 *      * Write: Any authenticated user
 *      * Update: Any authenticated user
 *      * Delete: Any authenticated user
 * 
 * 3. CREATE COLLECTION: notification-history  
 *    - Click "Create Collection"
 *    - Collection ID: notification-history
 *    - Collection Name: Notification History
 *    - Permissions:
 *      * Read: Any authenticated user  
 *      * Write: Any authenticated user
 *      * Update: Any authenticated user
 *      * Delete: Any authenticated user
 * 
 * ================================================================================================
 * ATTRIBUTES FOR food-swap-notifications COLLECTION:
 * ================================================================================================
 * 
 * After creating the collection, add these attributes:
 * 
 * 1. foodItemId (String, Required, Size: 255)
 * 2. foodTitle (String, Required, Size: 255)
 * 3. foodImageUri (String, Required, Size: 500)
 * 4. ownerId (String, Required, Size: 255)
 * 5. ownerName (String, Required, Size: 255)
 * 6. requesterId (String, Required, Size: 255)
 * 7. requesterName (String, Required, Size: 255)
 * 8. message (String, Optional, Size: 1000)
 * 9. status (String, Required, Size: 50, Default: "pending")
 * 10. type (String, Required, Size: 50, Default: "food_request")
 * 11. read (Boolean, Required, Default: false)
 * 12. acceptedAt (DateTime, Optional)
 * 13. rejectedAt (DateTime, Optional)
 * 14. transactionId (String, Optional, Size: 255)
 * 15. chatRoomId (String, Optional, Size: 255)
 * 16. createdAt (DateTime, Required)
 * 17. updatedAt (DateTime, Required)
 * 
 * ================================================================================================
 * ATTRIBUTES FOR notification-history COLLECTION:
 * ================================================================================================
 * 
 * After creating the collection, add these attributes:
 * 
 * 1. userId (String, Required, Size: 255)
 * 2. notificationId (String, Required, Size: 255)
 * 3. type (String, Required, Size: 100)
 * 4. title (String, Required, Size: 255)
 * 5. description (String, Required, Size: 1000)
 * 6. relatedUserId (String, Required, Size: 255)
 * 7. relatedUserName (String, Required, Size: 255)
 * 8. foodItemId (String, Optional, Size: 255)
 * 9. foodTitle (String, Optional, Size: 255)
 * 10. transactionId (String, Optional, Size: 255)
 * 11. read (Boolean, Required, Default: false)
 * 12. createdAt (DateTime, Required)
 * 
 * ================================================================================================
 * AFTER CREATING COLLECTIONS:
 * ================================================================================================
 * 
 * 1. The "collection with requested id cannot be found" error should be resolved
 * 2. Your notification system will work properly
 * 3. Food swap requests will be saved correctly
 * 4. Notification history will be tracked
 * 
 * ================================================================================================
 */

console.log('� Please check the comments above for detailed instructions on creating the missing Appwrite collections.');
console.log('🔗 Direct link: https://cloud.appwrite.io/console/project-feest/databases/database-685060470025155bac52');
