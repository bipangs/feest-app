import { FoodItem, FoodRequest } from '@/types/food';
import { Account, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

// APPWRITE DOCUMENT ID PATTERN:
// - Every Appwrite document has an auto-generated '$id' field
// - To get the ID of any document: document.$id
// - When creating: Appwrite auto-generates the $id using ID.unique()
// - When referencing: Store the $id value in foreign key fields (e.g., ownerId, foodItemId)
// - Collections contain documents, and each document's name/identifier is its $id

const client = new Client();
client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('feest')
  .setPlatform('com.streetbyteid.feest');

const databases = new Databases(client);
const storage = new Storage(client);
const account = new Account(client);

const DATABASE_ID = '685060470025155bac52';
const FOOD_COLLECTION_ID = 'food-items';
const FOOD_REQUESTS_COLLECTION_ID = 'food-requests';
const USER_PROFILES_COLLECTION_ID = 'user_profiles';
const TRANSACTIONS_COLLECTION_ID = 'transactions';
const NOTIFICATION_COLLECTION_ID = 'notification'; // Single notification collection
const STORAGE_BUCKET_ID = 'food-images';

export class FoodService {  // Ensure user is authenticated
  static async ensureUserPermissions(): Promise<void> {
    await this.ensureValidSession();
  }
  // Ensure user is authenticated (for read operations)
  static async ensureAuthenticated(): Promise<void> {
    await this.ensureValidSession();
  }

  // Enhanced authentication check with session refresh
  static async ensureValidSession(): Promise<void> {
    try {
      // First, try to get current session
      const session = await account.get();
      console.log('Session valid for user:', session.email);
    } catch (error: any) {
      console.error('Session check failed:', error);
      
      // If it's a 401 error, the session is expired
      if (error.code === 401 || error.type === 'user_session_not_found') {
        throw new Error('Your session has expired. Please log out and log back in to continue.');
      }
      
      // For other errors, re-throw
      throw error;
    }
  }

  // Get proper image URL for viewing images
  static getImageUrl(fileId: string): string {
    // Use the public view URL that works with authenticated sessions
    return `https://syd.cloud.appwrite.io/v1/storage/buckets/${STORAGE_BUCKET_ID}/files/${fileId}/view?project=feest`;
  }

  // Get image URL with proper authentication headers
  static async getAuthenticatedImageUrl(fileId: string): Promise<string> {
    try {
      // Ensure user is authenticated
      await this.ensureAuthenticated();
      
      // Get the file preview URL that works with user session
      const url = storage.getFilePreview(STORAGE_BUCKET_ID, fileId, 800, 600);
      return url.toString();
    } catch (error) {
      console.error('Error getting authenticated image URL:', error);
      // Fallback to public URL
      return this.getImageUrl(fileId);
    }
  }  // Create a new food item
  static async createFoodItem(foodData: Omit<FoodItem, '$id' | 'createdAt' | 'updatedAt'>): Promise<FoodItem> {
    try {
      // Ensure user is authenticated before creating food item
      await this.ensureUserPermissions();
      
      // Get current user to set as owner
      const currentUser = await account.get();
      
      // Create document - Appwrite auto-generates the $id using ID.unique()
      const document = await databases.createDocument(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        ID.unique(), // This becomes the document's $id (the document name in the collection)
        {
          ...foodData,
          ownerId: currentUser.$id, // Reference to user document's $id
          expiryDate: foodData.expiryDate.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );      return {
        ...document,
        expiryDate: new Date(document.expiryDate),
        createdAt: new Date(document.createdAt),
        updatedAt: new Date(document.updatedAt),
      } as unknown as FoodItem;
      // Note: document.$id is automatically included in the returned object
    } catch (error) {
      console.error('Error creating food item:', error);
      throw error;
    }
  }// Get all available food items
  static async getFoodItems(status?: string): Promise<FoodItem[]> {
    try {
      const queries = status ? [Query.equal('status', status)] : [];
      queries.push(Query.orderDesc('createdAt'));
        const response = await databases.listDocuments(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        queries
      );
      
      return response.documents.map(doc => ({
        ...doc,
        imageUri: this.fixImageUrl(doc.imageUri || ''),
        expiryDate: new Date(doc.expiryDate),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      })) as unknown as FoodItem[];
    } catch (error) {
      console.error('Error fetching food items, using mock data:', error);
      // Return mock data for development/testing
      return status ? mockFoodItems.filter(item => item.status === status) : mockFoodItems;
    }
  }  // Get all available food items with efficient IP location resolution
  static async getFoodItemsWithLocation(status?: string): Promise<FoodItem[]> {
    try {
      const queries = status ? [Query.equal('status', status)] : [];
      queries.push(Query.orderDesc('createdAt'));
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        queries
      );
        const items = response.documents.map(doc => ({
        ...doc,
        imageUri: this.fixImageUrl(doc.imageUri || ''),
        expiryDate: new Date(doc.expiryDate),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      })) as unknown as FoodItem[];

      // Efficiently resolve IP-based locations using batch processing
      const { LocationUtils } = await import('@/utils/locationUtils');
      const resolvedItems = await LocationUtils.processFoodItemLocations(items);
      
      return resolvedItems;
    } catch (error) {
      console.error('Error fetching food items with location, using mock data:', error);
      // Return mock data for development/testing with IP resolution
      const { LocationUtils } = await import('@/utils/locationUtils');
      const filteredMockData = status ? mockFoodItems.filter(item => item.status === status) : mockFoodItems;
      const resolvedMockData = await LocationUtils.processFoodItemLocations(filteredMockData);
      return resolvedMockData;
    }
  }

  // Get food items by user
  static async getUserFoodItems(userId: string): Promise<FoodItem[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        [
          Query.equal('ownerId', userId),
          Query.orderDesc('createdAt')
        ]
      );
        return response.documents.map(doc => ({
        ...doc,
        imageUri: this.fixImageUrl(doc.imageUri || ''),
        expiryDate: new Date(doc.expiryDate),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      })) as unknown as FoodItem[];
    } catch (error) {
      console.error('Error fetching user food items:', error);
      throw error;
    }
  }  // Get a single food item by ID
  static async getFoodItem(foodItemId: string): Promise<FoodItem> {
    try {
      // The foodItemId parameter is the document's $id within the collection
      const response = await databases.getDocument(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        foodItemId // This is the document's $id (document name in collection)
      );      return {
        ...response,
        imageUri: this.fixImageUrl(response.imageUri || ''),
        expiryDate: new Date(response.expiryDate),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      } as unknown as FoodItem;
      // Note: response.$id contains the document's unique identifier
    } catch (error) {
      console.error('Error fetching food item:', error);
      throw error;
    }
  }  // Update food item status (only owner can update)
  static async updateFoodItemStatus(foodId: string, status: FoodItem['status']): Promise<void> {
    try {
      // Ensure user is authenticated before updating
      await this.ensureUserPermissions();
      
      // Get current user
      const currentUser = await account.get();
      
      // Get the food item to check ownership
      const foodItem = await databases.getDocument(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        foodId // This foodId parameter is the document's $id
      );
      
      // Check if current user is the owner (comparing user $id with stored ownerId)
      if (foodItem.ownerId !== currentUser.$id) {
        throw new Error('Only the owner can update this food item.');
      }
      
      await databases.updateDocument(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        foodId, // Document's $id
        {
          status,
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Error updating food item status:', error);
      throw error;
    }
  }// Delete food item (only owner can delete)
  static async deleteFoodItem(foodId: string): Promise<void> {
    try {
      // Ensure user is authenticated before deleting
      await this.ensureUserPermissions();
      
      // Get current user
      const currentUser = await account.get();
      
      // Get the food item to check ownership
      const foodItem = await databases.getDocument(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        foodId
      );
      
      // Check if current user is the owner
      if (foodItem.ownerId !== currentUser.$id) {
        throw new Error('Only the owner can delete this food item.');
      }
      
      await databases.deleteDocument(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        foodId
      );
    } catch (error) {
      console.error('Error deleting food item:', error);
      throw error;
    }
  }

  // Upload image to storage
  static async uploadFoodImage(imageUri: string, fileName: string): Promise<string> {
    try {
      // Ensure user is authenticated before uploading
      await this.ensureAuthenticated();
      
      const response = await fetch(imageUri);
      const blob = await response.blob();
        const file = await storage.createFile(
        STORAGE_BUCKET_ID,
        ID.unique(), // Appwrite generates unique $id for the file
        {
          name: fileName,
          type: blob.type,
          size: blob.size,
          uri: imageUri,
        }
      );        
      
      // Return a public view URL using the file's $id
      const imageUrl = `https://syd.cloud.appwrite.io/v1/storage/buckets/${STORAGE_BUCKET_ID}/files/${file.$id}/view?project=feest`;
      return imageUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }  // Create food request
  static async createFoodRequest(requestData: Omit<FoodRequest, '$id' | 'createdAt'>): Promise<FoodRequest> {
    try {
      // Ensure user is authenticated before creating request
      await this.ensureUserPermissions();
      
      // Create document - Appwrite will auto-generate $id for this request
      const document = await databases.createDocument(
        DATABASE_ID,
        FOOD_REQUESTS_COLLECTION_ID,
        ID.unique(), // This becomes the document's $id (the document name in the collection)
        {
          ...requestData,
          createdAt: new Date().toISOString(),
        }
      );
      return {
        ...document,
        createdAt: new Date(document.createdAt),
      } as unknown as FoodRequest;
    } catch (error) {
      console.error('Error creating food request:', error);
      throw error;
    }
  }

  // Get requests for a food item
  static async getFoodRequests(foodItemId: string): Promise<FoodRequest[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FOOD_REQUESTS_COLLECTION_ID,
        [
          Query.equal('foodItemId', foodItemId),
          Query.orderDesc('createdAt')
        ]
      );
        return response.documents.map(doc => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
      })) as unknown as FoodRequest[];
    } catch (error) {
      console.error('Error fetching food requests:', error);
      throw error;
    }  }

  // Update request status
  static async updateRequestStatus(requestId: string, status: FoodRequest['status']): Promise<void> {
    try {
      // Ensure user is authenticated before updating request
      await this.ensureUserPermissions();
      
      await databases.updateDocument(
        DATABASE_ID,
        FOOD_REQUESTS_COLLECTION_ID,
        requestId,
        { status }
      );
    } catch (error) {
      console.error('Error updating request status:', error);
      throw error;
    }
  }  // Create food swap request with notification system
  static async createFoodSwapRequest(
    foodItemId: string,
    requestMessage?: string
  ): Promise<{ success: boolean; notificationId?: string; message: string }> {
    try {
      console.log('🔍 FoodService.createFoodSwapRequest called with:', { foodItemId, requestMessage });
      
      await this.ensureUserPermissions();
      const currentUser = await account.get();
      console.log('👤 Current user:', currentUser.email);      // Get the current user profile to get the name
      const currentUserProfile = await databases.getDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        currentUser.$id
      );

      if (!currentUserProfile) {
        return {
          success: false,
          message: "User profile not found. Please complete your profile setup."
        };
      }

      // Get the food item details
      console.log('📋 Getting food item details...');
      const foodItem = await this.getFoodItem(foodItemId);
      console.log('🍎 Food item:', foodItem.title, 'Owner:', foodItem.ownerName);

      // Check if user is trying to request their own food
      if (foodItem.ownerId === currentUser.$id) {
        console.log('❌ User trying to request own food');
        return {
          success: false,
          message: "You cannot request your own food item"
        };
      }

      // Check if food item is available
      if (foodItem.status !== 'available') {
        console.log('❌ Food item not available, status:', foodItem.status);
        return {
          success: false,
          message: "This food item is no longer available"
        };
      }      // Check if user has already sent a notification for this item
      console.log('🔍 Checking for existing notifications...');
      const { NotificationService } = await import('./notificationService');
      const existingNotifications = await databases.listDocuments(
        DATABASE_ID,
        NOTIFICATION_COLLECTION_ID, // Use notification collection for checking existing notifications
        [
          Query.equal('foodItemId', foodItemId),
          Query.equal('fromUserId', currentUser.$id),
          Query.equal('type', 'food_request')
        ]
      );

      if (existingNotifications.documents.length > 0) {
        console.log('❌ User already has pending request');
        return {
          success: false,
          message: "You have already requested this food item"
        };
      }

      // Create notification instead of transaction
      console.log('📬 Creating notification for food owner...');
      const notification = await NotificationService.createNotification(
        currentUser.$id,        // fromUserId (requester)
        foodItem.ownerId,       // toUserId (owner)
        foodItemId,
        'food_request',
        requestMessage || `${currentUserProfile.name} would like to swap for your "${foodItem.title}"`
      );

      console.log('✅ Notification created successfully:', notification.$id);

      return {
        success: true,
        notificationId: notification.$id,
        message: "Request sent successfully! The owner will be notified and can accept or decline your request."
      };

    } catch (error: any) {
      console.error('Error creating food swap request:', error);
      return {
        success: false,
        message: `Failed to create swap request: ${error.message}`
      };
    }
  }
  // Handle food swap notification response (accept/reject)
  static async respondToFoodSwapNotification(
    notificationId: string,
    response: 'accepted' | 'rejected',
    responseMessage?: string
  ): Promise<{ success: boolean; transactionId?: string; chatRoomId?: string; message: string }> {
    try {
      await this.ensureUserPermissions();
      const currentUser = await account.get();

      // Import services
      const { NotificationService } = await import('./notificationService');
      const { TransactionService } = await import('./transactionService');
      const { ChatService } = await import('./chatService');

      // Get the notification details
      const notification = await NotificationService.getNotification(notificationId);

      // Get the food item to verify ownership and details
      const foodItem = await this.getFoodItem(notification.foodItemId);

      // Verify the current user is the owner of the food item
      if (foodItem.ownerId !== currentUser.$id) {
        return {
          success: false,
          message: "You are not authorized to respond to this notification"
        };
      }

      // Check if notification is for a food request
      if (notification.type !== 'food_request') {
        return {
          success: false,
          message: "This notification has already been responded to"
        };
      }

      if (response === 'rejected') {
        // Update notification to rejected
        await NotificationService.updateNotification(notificationId, {
          type: 'request_rejected',
          message: responseMessage || 'Your request was declined',
          read: true
        });

        // Create a response notification to the requester
        await NotificationService.createNotification(
          currentUser.$id,          // fromUserId (owner)
          notification.fromUserId,  // toUserId (requester)
          notification.foodItemId,
          'request_rejected',
          responseMessage || `Your request for "${foodItem.title}" was declined`
        );

        return {
          success: true,
          message: "Request rejected successfully"
        };
      } else {
        // Accept the notification - create transaction and chat room
        console.log('✅ Accepting notification, creating transaction and chat...');

        // Verify food item is still available
        if (foodItem.status !== 'available') {
          return {
            success: false,
            message: "This food item is no longer available"
          };
        }        // Get user profiles for names
        const [ownerProfile, requesterProfile] = await Promise.all([
          databases.getDocument(DATABASE_ID, USER_PROFILES_COLLECTION_ID, currentUser.$id),
          databases.getDocument(DATABASE_ID, USER_PROFILES_COLLECTION_ID, notification.fromUserId)
        ]);

        // Create a private chat room for this transaction
        const chatRoom = await ChatService.createChatRoom(
          `Transaction: ${foodItem.title}`,
          `Transaction chat for ${foodItem.title}`,
          true, // Private
          [currentUser.$id, notification.fromUserId] // Owner and requester
        );

        // Create the transaction
        const transaction = await TransactionService.createTransaction(
          notification.foodItemId,
          currentUser.$id,
          ownerProfile.name,
          notification.message
        );

        // Update the notification to accepted
        await NotificationService.updateNotification(notificationId, {
          type: 'request_accepted',
          message: responseMessage || 'Your request was accepted!',
          read: true
        });

        // Create a response notification to the requester
        await NotificationService.createNotification(
          currentUser.$id,          // fromUserId (owner)
          notification.fromUserId,  // toUserId (requester)
          notification.foodItemId,
          'request_accepted',
          responseMessage || `Your request for "${foodItem.title}" was accepted!`
        );

        // Send initial system message to chat
        await ChatService.sendMessage(
          chatRoom.$id!,
          `Transaction started for "${foodItem.title}". ${ownerProfile.name} has accepted the food swap request from ${requesterProfile.name}.`,
          'system'
        );

        if (responseMessage) {
          await ChatService.sendMessage(
            chatRoom.$id!,
            responseMessage,
            'text'
          );
        }

        // Update food item status to requested
        await this.updateFoodItemStatus(notification.foodItemId, 'requested');

        return {
          success: true,
          transactionId: transaction.$id,
          chatRoomId: chatRoom.$id,
          message: "Request accepted! Transaction and chat room created successfully."
        };
      }
    } catch (error: any) {
      console.error('Error responding to food swap notification:', error);
      return {
        success: false,
        message: `Failed to respond to notification: ${error.message}`
      };
    }
  }

  // Get pending requests for food owner
  static async getPendingRequestsForOwner(): Promise<FoodRequest[]> {
    try {
      await this.ensureAuthenticated();
      const currentUser = await account.get();

      // Get all food items owned by current user
      const userFoodItems = await databases.listDocuments(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        [Query.equal('ownerId', currentUser.$id)]
      );

      const foodItemIds = userFoodItems.documents.map(item => item.$id);
      
      if (foodItemIds.length === 0) {
        return [];
      }

      // Get all pending requests for user's food items
      const allRequests: FoodRequest[] = [];
      
      for (const foodItemId of foodItemIds) {
        const requests = await this.getFoodRequests(foodItemId);
        const pendingRequests = requests.filter(req => req.status === 'pending');
        allRequests.push(...pendingRequests);
      }

      return allRequests.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    } catch (error: any) {
      console.error('Error getting pending requests:', error);
      throw error;
    }
  }

  // Get user's sent requests
  static async getUserSentRequests(): Promise<FoodRequest[]> {
    try {
      await this.ensureAuthenticated();
      const currentUser = await account.get();

      const response = await databases.listDocuments(
        DATABASE_ID,
        FOOD_REQUESTS_COLLECTION_ID,
        [
          Query.equal('requesterId', currentUser.$id),
          Query.orderDesc('createdAt')
        ]
      );

      return response.documents.map(doc => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
      })) as unknown as FoodRequest[];

    } catch (error: any) {
      console.error('Error getting user sent requests:', error);
      throw error;
    }
  }

  // Test authentication and log session details
  static async testAuthentication(): Promise<void> {
    try {
      const session = await account.get();
      console.log('✅ User session active:', {
        userId: session.$id,
        email: session.email,
        name: session.name
      });

      // Test storage access
      try {
        const files = await storage.listFiles(STORAGE_BUCKET_ID);
        console.log('✅ Storage access working, files count:', files.files.length);
      } catch (storageError) {
        console.error('❌ Storage access failed:', storageError);
      }
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw new Error('User session expired. Please log in again.');
    }
  }

  // Fix image URLs that might have problematic parameters
  static fixImageUrl(imageUri: string): string {
    try {
      // If it's already a regular URL (not an Appwrite storage URL), return as is
      if (!imageUri.includes('cloud.appwrite.io') || !imageUri.includes('/storage/buckets/')) {
        return imageUri;
      }

      // Extract file ID from the URL
      const urlParts = imageUri.split('/');
      const filesIndex = urlParts.indexOf('files');
      if (filesIndex === -1 || filesIndex + 1 >= urlParts.length) {
        return imageUri;
      }

      const fileId = urlParts[filesIndex + 1].split('?')[0]; // Remove query parameters
      
      // Return a clean URL without problematic parameters
      return this.getImageUrl(fileId);
    } catch (error) {
      console.error('Error fixing image URL:', error);
      return imageUri; // Return original URL if fixing fails
    }
  }

  // ================================================================================================
  // SIMPLIFIED FOOD REQUEST - Using simple notifications (recommended approach)
  // ================================================================================================

  // Create a simple food request notification
  static async createSimpleFoodRequest(
    foodItemId: string,
    requestMessage?: string
  ): Promise<{ success: boolean; notificationId?: string; message: string }> {
    try {
      await this.ensureUserPermissions();
      
      const currentUser = await account.get();
      
      // Get the food item details
      const foodItem = await this.getFoodItem(foodItemId);
      
      // Check if user is trying to request their own item
      if (foodItem.ownerId === currentUser.$id) {
        return {
          success: false,
          message: "You cannot request your own food item."
        };
      }      // Get current user profile for name (simplified - just use user ID for now)
      // In a full implementation, you'd fetch the user's display name from user_profiles collection

      // Create simple notification message
      const message = requestMessage 
        ? `Someone wants your "${foodItem.title}": ${requestMessage}`
        : `Someone wants your "${foodItem.title}"`;

      // Import the notification service
      const { NotificationService } = await import('./notificationService');
        // Create notification
      const notification = await NotificationService.createNotification(
        currentUser.$id,     // from
        foodItem.ownerId,    // to
        foodItemId,          // about which food
        'food_request',      // type
        message              // simple message
      );

      console.log('✅ Simple notification created:', notification.$id);

      return {
        success: true,
        notificationId: notification.$id,
        message: "Request sent! The owner has been notified."
      };

    } catch (error: any) {
      console.error('Error creating simple food request:', error);
      return {
        success: false,
        message: error.message || 'Failed to send request. Please try again.'
      };
    }
  }

  // ================================================================================================
  // LEGACY METHODS - For backward compatibility
  // ================================================================================================

  // Create food request
  static async createFoodRequestLegacy(requestData: Omit<FoodRequest, '$id' | 'createdAt'>): Promise<FoodRequest> {
    try {
      // Ensure user is authenticated before creating request
      await this.ensureUserPermissions();
      
      // Create document - Appwrite will auto-generate $id for this request
      const document = await databases.createDocument(
        DATABASE_ID,
        FOOD_REQUESTS_COLLECTION_ID,
        ID.unique(), // This becomes the document's $id (the document name in the collection)
        {
          ...requestData,
          createdAt: new Date().toISOString(),
        }
      );
      return {
        ...document,
        createdAt: new Date(document.createdAt),
      } as unknown as FoodRequest;
    } catch (error) {
      console.error('Error creating food request (legacy):', error);
      throw error;
    }
  }

  // Get requests for a food item (legacy)
  static async getFoodRequestsLegacy(foodItemId: string): Promise<FoodRequest[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        FOOD_REQUESTS_COLLECTION_ID,
        [
          Query.equal('foodItemId', foodItemId),
          Query.orderDesc('createdAt')
        ]
      );
        return response.documents.map(doc => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
      })) as unknown as FoodRequest[];
    } catch (error) {
      console.error('Error fetching food requests (legacy):', error);
      throw error;
    }  }

  // Update request status (legacy)
  static async updateRequestStatusLegacy(requestId: string, status: FoodRequest['status']): Promise<void> {
    try {
      // Ensure user is authenticated before updating request
      await this.ensureUserPermissions();
      
      await databases.updateDocument(
        DATABASE_ID,
        FOOD_REQUESTS_COLLECTION_ID,
        requestId,
        { status }
      );
    } catch (error) {
      console.error('Error updating request status (legacy):', error);
      throw error;
    }
  }  // Create food swap request with notification system (legacy)
  static async createFoodSwapRequestLegacy(
    foodItemId: string,
    requestMessage?: string
  ): Promise<{ success: boolean; notificationId?: string; message: string }> {
    try {
      console.log('🔍 FoodService.createFoodSwapRequestLegacy called with:', { foodItemId, requestMessage });
      
      await this.ensureUserPermissions();
      const currentUser = await account.get();
      console.log('👤 Current user:', currentUser.email);      // Get the current user profile to get the name
      const currentUserProfile = await databases.getDocument(
        DATABASE_ID,
        USER_PROFILES_COLLECTION_ID,
        currentUser.$id
      );

      if (!currentUserProfile) {
        return {
          success: false,
          message: "User profile not found. Please complete your profile setup."
        };
      }

      // Get the food item details
      console.log('📋 Getting food item details...');
      const foodItem = await this.getFoodItem(foodItemId);
      console.log('🍎 Food item:', foodItem.title, 'Owner:', foodItem.ownerName);

      // Check if user is trying to request their own food
      if (foodItem.ownerId === currentUser.$id) {
        console.log('❌ User trying to request own food');
        return {
          success: false,
          message: "You cannot request your own food item"
        };
      }

      // Check if food item is available
      if (foodItem.status !== 'available') {
        console.log('❌ Food item not available, status:', foodItem.status);
        return {
          success: false,
          message: "This food item is no longer available"
        };
      }      // Check if user has already sent a notification for this item
      console.log('🔍 Checking for existing notifications...');
      const { NotificationService } = await import('./notificationService');
      const existingNotifications = await databases.listDocuments(
        DATABASE_ID,
        NOTIFICATION_COLLECTION_ID, // Use notification collection for checking existing notifications
        [
          Query.equal('foodItemId', foodItemId),
          Query.equal('fromUserId', currentUser.$id),
          Query.equal('type', 'food_request')
        ]
      );

      if (existingNotifications.documents.length > 0) {
        console.log('❌ User already has pending request');
        return {
          success: false,
          message: "You have already requested this food item"
        };
      }

      // Create notification instead of transaction
      console.log('📬 Creating notification for food owner...');
      const notification = await NotificationService.createNotification(
        currentUser.$id,        // fromUserId (requester)
        foodItem.ownerId,       // toUserId (owner)
        foodItemId,
        'food_request',
        requestMessage || `${currentUserProfile.name} would like to swap for your "${foodItem.title}"`
      );

      console.log('✅ Notification created successfully:', notification.$id);

      return {
        success: true,
        notificationId: notification.$id,
        message: "Request sent successfully! The owner will be notified and can accept or decline your request."
      };

    } catch (error: any) {
      console.error('Error creating food swap request (legacy):', error);
      return {
        success: false,
        message: `Failed to create swap request: ${error.message}`
      };
    }
  }
}

// Mock data for testing - remove when backend is ready
const mockFoodItems: FoodItem[] = [
  {
    $id: '1',
    title: 'Fresh Homemade Bread',
    description: 'Delicious sourdough bread baked this morning. Perfect for sharing!',
    imageUri: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=800',
    expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
    status: 'available',
    ownerId: 'user1',
    ownerName: 'Alice Johnson',
    location: 'Downtown Bakery District',
    locationIP: '192.168.1.100', // Mock IP - will be resolved to coordinates
    latitude: 40.7831,
    longitude: -73.9712,
    category: 'baked-goods',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    $id: '2',
    title: 'Organic Vegetables Bundle',
    description: 'Fresh organic vegetables from our garden: tomatoes, lettuce, carrots, and herbs.',
    imageUri: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800',
    expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
    status: 'available',
    ownerId: 'user2',
    ownerName: 'Bob Smith',
    location: 'Community Garden, Park Ave',
    locationIP: '192.168.1.101', // Mock IP
    latitude: 40.7678,
    longitude: -73.9645,
    category: 'vegetables',
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
  },
  {
    $id: '3',
    title: 'Leftover Pizza Slices',
    description: 'Half a large pepperoni pizza from last night. Still tastes great!',
    imageUri: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800',
    expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    status: 'available',
    ownerId: 'user3',
    ownerName: 'Carol Davis',
    location: 'University Campus',
    locationIP: '192.168.1.102', // Mock IP
    latitude: 40.7505,
    longitude: -73.9934,
    category: 'prepared-meals',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
  },
  {
    $id: '4',
    title: 'Fresh Fruit Basket',
    description: 'Assorted seasonal fruits: apples, pears, bananas, and oranges.',
    imageUri: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800',
    expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
    status: 'available',
    ownerId: 'user4',
    ownerName: 'David Wilson',
    location: 'Midtown Farmers Market',
    locationIP: '192.168.1.103', // Mock IP
    latitude: 40.7549,
    longitude: -73.9840,
    category: 'fruits',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
  },
];

/*
 * ================================================================================================
 * APPWRITE DOCUMENT ID PATTERN SUMMARY
 * ================================================================================================
 * 
 * In Appwrite, every document in a collection has a unique identifier called '$id'.
 * This $id serves as the "document name" within the collection.
 * 
 * KEY CONCEPTS:
 * 
 * 1. DOCUMENT CREATION:
 *    - When creating a document, use ID.unique() to auto-generate the $id
 *    - Appwrite assigns this as the document's unique identifier
 *    - Example: await databases.createDocument(dbId, collectionId, ID.unique(), data)
 * 
 * 2. ACCESSING DOCUMENT IDs:
 *    - To get any document's ID: document.$id
 *    - This $id is the document's "name" in the collection
 *    - Use this $id to reference the document from other documents
 * 
 * 3. REFERENCING OTHER DOCUMENTS:
 *    - Store the referenced document's $id in foreign key fields
 *    - Example: ownerId stores the User document's $id
 *    - Example: foodItemId stores the FoodItem document's $id
 * 
 * 4. QUERYING BY ID:
 *    - To get a specific document: databases.getDocument(dbId, collectionId, documentId)
 *    - The documentId parameter is the document's $id
 * 
 * 5. COLLECTIONS AS CONTAINERS:
 *    - Collections contain documents
 *    - Each document's "name" within the collection is its $id
 *    - Example: In 'food-items' collection, each food item document has a unique $id
 * 
 * PRACTICAL EXAMPLES FROM THIS SERVICE:
 * - currentUser.$id → The logged-in user's document ID
 * - foodItem.$id → A specific food item's document ID  
 * - file.$id → An uploaded file's unique identifier
 * - notification.$id → A notification document's ID
 * 
 * This pattern ensures referential integrity across all collections in the database.
 * ================================================================================================
 */
