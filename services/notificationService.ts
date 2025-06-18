import { SimpleNotification } from '@/types/notification';
import { Account, Client, Databases, ID, Query } from 'react-native-appwrite';

const client = new Client();
client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('feest')
  .setPlatform('com.streetbyteid.feest');

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = '685060470025155bac52';
const NOTIFICATION_COLLECTION_ID = 'notification';

export class NotificationService {
  // Ensure user is authenticated
  static async ensureAuthenticated(): Promise<void> {
    try {
      await account.get();
    } catch (error) {
      throw new Error('User not authenticated. Please log in and try again.');
    }
  }
  // Create a notification
  static async createNotification(
    fromUserId: string,
    toUserId: string, 
    foodItemId: string,
    type: SimpleNotification['type'],
    message: string
  ): Promise<SimpleNotification> {
    try {
      await this.ensureAuthenticated();

      const notificationData = {
        fromUserId,
        toUserId,
        foodItemId,
        type,
        message,
        read: false,
        createdAt: new Date().toISOString(),
      };

      console.log('📬 Creating notification...', notificationData);

      const document = await databases.createDocument(
        DATABASE_ID,
        NOTIFICATION_COLLECTION_ID,
        ID.unique(),
        notificationData
      );

      console.log('✅ Notification created:', document.$id);

      return {
        ...document,
        createdAt: new Date(document.createdAt),
      } as unknown as SimpleNotification;
    } catch (error: any) {
      console.error('❌ Error creating notification:', error);
      
      // Provide specific error messages for common issues
      if (error.code === 401 || error.type === 'user_unauthorized') {
        throw new Error('PERMISSION_ERROR: The notification collection permissions need to be updated in Appwrite. Please check APPWRITE_PERMISSION_FIX.md for instructions.');
      } else if (error.code === 404 || error.message?.includes('collection')) {
        throw new Error('COLLECTION_ERROR: The notification collection does not exist or is misconfigured in Appwrite.');
      } else if (error.message?.includes('authorized')) {
        throw new Error('AUTHORIZATION_ERROR: Current user does not have permission to create notifications. Check Appwrite collection permissions.');
      }
      
      throw error;
    }
  }

  // Get notifications for a user
  static async getUserNotifications(): Promise<SimpleNotification[]> {
    try {
      await this.ensureAuthenticated();
      const currentUser = await account.get();

      const response = await databases.listDocuments(
        DATABASE_ID,
        NOTIFICATION_COLLECTION_ID,
        [
          Query.equal('toUserId', currentUser.$id),
          Query.orderDesc('createdAt'),
        ]
      );

      return response.documents.map(doc => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
      })) as unknown as SimpleNotification[];
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  // Get a specific notification
  static async getNotification(notificationId: string): Promise<SimpleNotification> {
    try {
      const document = await databases.getDocument(
        DATABASE_ID,
        NOTIFICATION_COLLECTION_ID,
        notificationId
      );

      return {
        ...document,
        createdAt: new Date(document.createdAt),
      } as unknown as SimpleNotification;
    } catch (error) {
      console.error('Error getting notification:', error);
      throw error;
    }
  }

  // Mark notification as read
  static async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await databases.updateDocument(
        DATABASE_ID,
        NOTIFICATION_COLLECTION_ID,
        notificationId,
        { 
          read: true,
          readAt: new Date().toISOString()
        }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Update notification (for status changes like accepting/rejecting)
  static async updateNotification(
    notificationId: string, 
    updates: Partial<SimpleNotification>
  ): Promise<SimpleNotification> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      const document = await databases.updateDocument(
        DATABASE_ID,
        NOTIFICATION_COLLECTION_ID,
        notificationId,
        updateData
      );

      return {
        ...document,
        createdAt: new Date(document.createdAt),
      } as unknown as SimpleNotification;
    } catch (error) {
      console.error('Error updating notification:', error);
      throw error;
    }
  }

  // Delete notification
  static async deleteNotification(notificationId: string): Promise<void> {
    try {
      await databases.deleteDocument(
        DATABASE_ID,
        NOTIFICATION_COLLECTION_ID,
        notificationId
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }

  // Get notifications by type
  static async getNotificationsByType(
    userId: string, 
    type: SimpleNotification['type']
  ): Promise<SimpleNotification[]> {
    try {
      await this.ensureAuthenticated();

      const response = await databases.listDocuments(
        DATABASE_ID,
        NOTIFICATION_COLLECTION_ID,
        [
          Query.equal('toUserId', userId),
          Query.equal('type', type),
          Query.orderDesc('createdAt'),
        ]
      );

      return response.documents.map(doc => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
      })) as unknown as SimpleNotification[];
    } catch (error) {
      console.error('Error getting notifications by type:', error);
      throw error;
    }
  }

  // Get unread notifications count
  static async getUnreadCount(userId: string): Promise<number> {
    try {
      await this.ensureAuthenticated();

      const response = await databases.listDocuments(
        DATABASE_ID,
        NOTIFICATION_COLLECTION_ID,
        [
          Query.equal('toUserId', userId),
          Query.equal('read', false),
        ]
      );

      return response.total;
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }

  // Debug method to check collection permissions
  static async checkCollectionPermissions(): Promise<void> {
    try {
      console.log('🔍 Checking notification collection permissions...');
      
      await this.ensureAuthenticated();
      const currentUser = await account.get();
      console.log('✅ User authenticated:', currentUser.email, 'ID:', currentUser.$id);
      
      // Try to read documents first
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          NOTIFICATION_COLLECTION_ID,
          []
        );
        console.log('✅ Read permission works - found', response.total, 'notifications');
      } catch (readError: any) {
        console.log('❌ Read permission failed:', readError.message);
      }
      
      // Try to create a test document
      try {
        const testNotification = {
          fromUserId: currentUser.$id,
          toUserId: currentUser.$id,
          foodItemId: 'test',
          type: 'food_request' as const,
          message: 'Permission test',
          read: false,
          createdAt: new Date().toISOString(),
        };
        
        const testDoc = await databases.createDocument(
          DATABASE_ID,
          NOTIFICATION_COLLECTION_ID,
          ID.unique(),
          testNotification
        );
        
        console.log('✅ Write permission works - test document created:', testDoc.$id);
        
        // Clean up test document
        await databases.deleteDocument(DATABASE_ID, NOTIFICATION_COLLECTION_ID, testDoc.$id);
        console.log('✅ Delete permission works - test document cleaned up');
        
      } catch (writeError: any) {
        console.log('❌ Write permission failed:', writeError.message);
        console.log('🔧 Solution: Update Appwrite collection permissions. See APPWRITE_PERMISSION_FIX.md');
      }
      
    } catch (error) {
      console.error('❌ Permission check failed:', error);
    }
  }

  // Exported debug method for troubleshooting
  static async debugPermissions(): Promise<void> {
    return this.checkCollectionPermissions();
  }

  // Legacy method aliases for backward compatibility
  static async createSimpleNotification(
    fromUserId: string,
    toUserId: string, 
    foodItemId: string,
    type: SimpleNotification['type'],
    message: string
  ): Promise<SimpleNotification> {
    return this.createNotification(fromUserId, toUserId, foodItemId, type, message);
  }

  static async getSimpleNotifications(userId: string): Promise<SimpleNotification[]> {
    return this.getUserNotifications();
  }

  static async markSimpleNotificationAsRead(notificationId: string): Promise<void> {
    return this.markNotificationAsRead(notificationId);
  }
}
