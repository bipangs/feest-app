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
    } catch (error) {
      console.error('Error creating notification:', error);
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
