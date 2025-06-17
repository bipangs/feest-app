import { CompletionProof, Transaction } from '@/types/transaction';
import { Account, Client, Databases, ID, Query } from 'react-native-appwrite';
import { ChatService } from './chatService';
import { FoodService } from './foodService';

const client = new Client();
client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('feest')
  .setPlatform('com.streetbyteid.feest');

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = '685060470025155bac52';
const TRANSACTIONS_COLLECTION_ID = 'transactions';
const TRANSACTION_MESSAGES_COLLECTION_ID = 'transaction-messages';
const COMPLETION_PROOFS_COLLECTION_ID = 'completion-proofs';

export class TransactionService {
  // Ensure user is authenticated
  static async ensureAuthenticated(): Promise<void> {
    try {
      await account.get();
    } catch (error) {
      throw new Error('User not authenticated. Please log in and try again.');
    }
  }

  // Create a new transaction when someone requests food
  static async createTransaction(
    foodItemId: string,
    ownerId: string,
    ownerName: string,
    requestMessage?: string
  ): Promise<Transaction> {
    try {
      await this.ensureAuthenticated();
      const currentUser = await account.get();      // Get food item details
      const foodItem = await FoodService.getFoodItem(foodItemId);

      // Create a private chat room for this transaction
      const chatRoom = await ChatService.createChatRoom(
        `Transaction: ${foodItem.title}`,
        `Transaction chat for ${foodItem.title}`,
        true, // Private
        [ownerId, currentUser.$id] // Owner and requester
      );

      const transactionData = {
        foodItemId,
        foodTitle: foodItem.title,
        ownerId,
        ownerName,
        requesterId: currentUser.$id,
        requesterName: currentUser.name || currentUser.email,
        chatRoomId: chatRoom.$id,
        status: 'pending' as const,
        requestMessage,
        requestedDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        ID.unique(),
        transactionData
      );

      // Send initial system message to chat
      if (chatRoom.$id) {
        await ChatService.sendMessage(
          chatRoom.$id,
          `Transaction started for "${foodItem.title}". ${currentUser.name || currentUser.email} has requested this food item.`,
          'system'
        );

        if (requestMessage) {
          await ChatService.sendMessage(
            chatRoom.$id,
            requestMessage,
            'text'
          );
        }
      }

      // Update food item status to requested
      await FoodService.updateFoodItemStatus(foodItemId, 'requested');

      return { ...transactionData, $id: response.$id } as Transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Accept a transaction (owner accepts the request)
  static async acceptTransaction(transactionId: string): Promise<Transaction> {
    try {
      await this.ensureAuthenticated();
      const currentUser = await account.get();

      const transaction = await this.getTransaction(transactionId);

      if (transaction.ownerId !== currentUser.$id) {
        throw new Error('Only the owner can accept this transaction');
      }

      if (transaction.status !== 'pending') {
        throw new Error('Transaction is not in pending status');
      }

      const updatedData = {
        status: 'accepted' as const,
        acceptedDate: new Date(),
        updatedAt: new Date(),
      };

      const response = await databases.updateDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        transactionId,
        updatedData
      );

      // Send system message to chat
      if (transaction.chatRoomId) {
        await ChatService.sendMessage(
          transaction.chatRoomId,
          `${transaction.ownerName} has accepted the food request! You can now chat to arrange the pickup.`,
          'system'
        );
      }

      return { ...transaction, ...updatedData } as Transaction;
    } catch (error) {
      console.error('Error accepting transaction:', error);
      throw error;
    }
  }

  // Complete transaction with photo proof (owner completes)
  static async completeTransaction(
    transactionId: string,
    completionPhotoUri: string
  ): Promise<Transaction> {
    try {
      await this.ensureAuthenticated();
      const currentUser = await account.get();

      const transaction = await this.getTransaction(transactionId);

      if (transaction.ownerId !== currentUser.$id) {
        throw new Error('Only the owner can complete this transaction');
      }

      if (transaction.status !== 'accepted') {
        throw new Error('Transaction must be accepted before completion');
      }

      const completionDate = new Date();
      const chatExpiresAt = new Date(completionDate.getTime() + 6 * 60 * 60 * 1000); // 6 hours from now

      const updatedData = {
        status: 'completed' as const,
        completionPhoto: completionPhotoUri,
        completedDate: completionDate,
        chatExpiresAt,
        updatedAt: new Date(),
      };

      const response = await databases.updateDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        transactionId,
        updatedData
      );

      // Store completion proof
      await this.createCompletionProof(transactionId, completionPhotoUri);

      // Update food item status to completed
      await FoodService.updateFoodItemStatus(transaction.foodItemId, 'completed');

      // Send system message to chat with photo
      if (transaction.chatRoomId) {
        await ChatService.sendMessage(
          transaction.chatRoomId,
          `Transaction completed! ${transaction.ownerName} has provided the food with photo proof. This chat will be automatically deleted in 6 hours.`,
          'system'
        );

        // Send the completion photo as a message
        await ChatService.sendMessage(
          transaction.chatRoomId,
          'Completion photo:',
          'completion_photo'
        );
      }

      return { ...transaction, ...updatedData } as Transaction;
    } catch (error) {
      console.error('Error completing transaction:', error);
      throw error;
    }
  }

  // Cancel transaction
  static async cancelTransaction(transactionId: string, reason?: string): Promise<Transaction> {
    try {
      await this.ensureAuthenticated();
      const currentUser = await account.get();

      const transaction = await this.getTransaction(transactionId);

      // Only owner or requester can cancel
      if (transaction.ownerId !== currentUser.$id && transaction.requesterId !== currentUser.$id) {
        throw new Error('You do not have permission to cancel this transaction');
      }

      if (transaction.status === 'completed' || transaction.status === 'cancelled') {
        throw new Error('Cannot cancel a completed or already cancelled transaction');
      }

      const updatedData = {
        status: 'cancelled' as const,
        updatedAt: new Date(),
      };

      const response = await databases.updateDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        transactionId,
        updatedData
      );

      // Send system message to chat
      if (transaction.chatRoomId) {
        const cancellerName = currentUser.$id === transaction.ownerId ? transaction.ownerName : transaction.requesterName;
        await ChatService.sendMessage(
          transaction.chatRoomId,
          `Transaction cancelled by ${cancellerName}. ${reason ? `Reason: ${reason}` : ''}`,
          'system'
        );
      }

      // Update food item status back to available if owner cancels
      if (transaction.ownerId === currentUser.$id) {
        await FoodService.updateFoodItemStatus(transaction.foodItemId, 'available');
      }

      return { ...transaction, ...updatedData } as Transaction;
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      throw error;
    }
  }

  // Get a single transaction
  static async getTransaction(transactionId: string): Promise<Transaction> {
    try {
      await this.ensureAuthenticated();

      const response = await databases.getDocument(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        transactionId
      );      return {
        $id: response.$id,
        foodItemId: response.foodItemId,
        foodTitle: response.foodTitle,
        ownerId: response.ownerId,
        ownerName: response.ownerName,
        requesterId: response.requesterId,
        requesterName: response.requesterName,
        chatRoomId: response.chatRoomId,
        status: response.status,
        requestMessage: response.requestMessage,
        completionPhoto: response.completionPhoto,
        requestedDate: new Date(response.requestedDate),
        acceptedDate: response.acceptedDate ? new Date(response.acceptedDate) : undefined,
        completedDate: response.completedDate ? new Date(response.completedDate) : undefined,
        chatExpiresAt: response.chatExpiresAt ? new Date(response.chatExpiresAt) : undefined,
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      } as Transaction;
    } catch (error) {
      console.error('Error getting transaction:', error);
      throw error;
    }
  }

  // Get user's transactions (as owner or requester)
  static async getUserTransactions(): Promise<Transaction[]> {
    try {
      await this.ensureAuthenticated();
      const currentUser = await account.get();

      // Get transactions where user is either owner or requester
      const [ownerTransactions, requesterTransactions] = await Promise.all([
        databases.listDocuments(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          [
            Query.equal('ownerId', currentUser.$id),
            Query.orderDesc('createdAt'),
            Query.limit(50)
          ]
        ),
        databases.listDocuments(
          DATABASE_ID,
          TRANSACTIONS_COLLECTION_ID,
          [
            Query.equal('requesterId', currentUser.$id),
            Query.orderDesc('createdAt'),
            Query.limit(50)
          ]
        )
      ]);

      // Combine and deduplicate
      const allTransactions = [...ownerTransactions.documents, ...requesterTransactions.documents];
      const uniqueTransactions = allTransactions.filter((transaction, index, self) => 
        index === self.findIndex(t => t.$id === transaction.$id)
      );      return uniqueTransactions.map(doc => ({
        $id: doc.$id,
        foodItemId: doc.foodItemId,
        foodTitle: doc.foodTitle,
        ownerId: doc.ownerId,
        ownerName: doc.ownerName,
        requesterId: doc.requesterId,
        requesterName: doc.requesterName,
        chatRoomId: doc.chatRoomId,
        status: doc.status,
        requestMessage: doc.requestMessage,
        completionPhoto: doc.completionPhoto,
        requestedDate: new Date(doc.requestedDate),
        acceptedDate: doc.acceptedDate ? new Date(doc.acceptedDate) : undefined,
        completedDate: doc.completedDate ? new Date(doc.completedDate) : undefined,
        chatExpiresAt: doc.chatExpiresAt ? new Date(doc.chatExpiresAt) : undefined,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      })) as Transaction[];
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  }

  // Create completion proof
  static async createCompletionProof(
    transactionId: string,
    photoUri: string
  ): Promise<CompletionProof> {
    try {
      await this.ensureAuthenticated();
      const currentUser = await account.get();

      const proofData = {
        transactionId,
        photoUri,
        takenAt: new Date(),
        uploadedBy: currentUser.$id,
      };

      const response = await databases.createDocument(
        DATABASE_ID,
        COMPLETION_PROOFS_COLLECTION_ID,
        ID.unique(),
        proofData
      );

      return { ...proofData, $id: response.$id } as CompletionProof;
    } catch (error) {
      console.error('Error creating completion proof:', error);
      throw error;
    }
  }

  // Clean up expired chats (should be called periodically)
  static async cleanupExpiredChats(): Promise<void> {
    try {
      await this.ensureAuthenticated();
      
      const now = new Date();
      const expiredTransactions = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        [
          Query.equal('status', 'completed'),
          Query.lessThan('chatExpiresAt', now.toISOString()),
          Query.limit(50)
        ]
      );

      for (const transaction of expiredTransactions.documents) {
        if (transaction.chatRoomId) {
          // Delete the chat room and its messages
          await ChatService.deleteChatRoom(transaction.chatRoomId);
          
          // Update transaction to remove chat room reference
          await databases.updateDocument(
            DATABASE_ID,
            TRANSACTIONS_COLLECTION_ID,
            transaction.$id,
            { chatRoomId: null }
          );
        }
      }
    } catch (error) {
      console.error('Error cleaning up expired chats:', error);
      throw error;
    }
  }

  // Get transaction by food item ID
  static async getTransactionByFoodItem(foodItemId: string): Promise<Transaction | null> {
    try {
      await this.ensureAuthenticated();

      const response = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        [
          Query.equal('foodItemId', foodItemId),
          Query.notEqual('status', 'cancelled'),
          Query.orderDesc('createdAt'),
          Query.limit(1)
        ]
      );

      if (response.documents.length === 0) {
        return null;
      }

      const doc = response.documents[0];      return {
        $id: doc.$id,
        foodItemId: doc.foodItemId,
        foodTitle: doc.foodTitle,
        ownerId: doc.ownerId,
        ownerName: doc.ownerName,
        requesterId: doc.requesterId,
        requesterName: doc.requesterName,
        chatRoomId: doc.chatRoomId,
        status: doc.status,
        requestMessage: doc.requestMessage,
        completionPhoto: doc.completionPhoto,
        requestedDate: new Date(doc.requestedDate),
        acceptedDate: doc.acceptedDate ? new Date(doc.acceptedDate) : undefined,
        completedDate: doc.completedDate ? new Date(doc.completedDate) : undefined,
        chatExpiresAt: doc.chatExpiresAt ? new Date(doc.chatExpiresAt) : undefined,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      } as Transaction;
    } catch (error) {
      console.error('Error getting transaction by food item:', error);
      throw error;
    }
  }
}
