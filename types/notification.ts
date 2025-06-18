// Simple notification interface - the main schema we use
export interface SimpleNotification {
  $id?: string;                    // Appwrite document ID
  fromUserId: string;              // Who sent this notification
  toUserId: string;                // Who receives this notification
  foodItemId: string;              // Which food item this is about
  type: 'food_request' | 'request_accepted' | 'request_rejected';
  message: string;                 // Simple text message
  read: boolean;                   // Has the user read it?
  createdAt: Date;                 // When was it created
  readAt?: Date;                   // When was it read
  updatedAt?: Date;                // When was it last updated
}

// Type aliases for convenience
export type NotificationType = SimpleNotification['type'];
export type NotificationStatus = 'pending' | 'accepted' | 'rejected';
