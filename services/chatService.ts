import { ChatMessage, ChatParticipant, ChatRoom } from '@/types/chat';
import { Account, Client, Databases, ID, Query } from 'react-native-appwrite';

const client = new Client();
client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('feest')
  .setPlatform('com.streetbyteid.feest');

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = '685060470025155bac52';
const CHAT_ROOMS_COLLECTION_ID = 'chat-rooms';
const CHAT_MESSAGES_COLLECTION_ID = 'chat-messages';
const CHAT_PARTICIPANTS_COLLECTION_ID = 'chat-participants';
const USER_PROFILES_COLLECTION_ID = 'user_profiles';

export class ChatService {  // Ensure user is authenticated
  static async ensureUserPermissions(): Promise<void> {
    try {
      await account.get();
    } catch (error) {
      throw new Error('User not authenticated. Please log in and try again.');
    }
  }

  // Ensure user is authenticated (for read operations)
  static async ensureAuthenticated(): Promise<void> {
    try {
      await account.get();
    } catch (error) {
      throw new Error('User not authenticated. Please log in and try again.');
    }
  }
  // Create a new chat room
  static async createChatRoom(
    name: string,
    description: string,
    isPrivate: boolean = false,
    participants: string[] = []
  ): Promise<ChatRoom> {
    try {
      await this.ensureUserPermissions();
      const currentUser = await account.get();

      const chatRoomData = {
        name,
        description,
        createdBy: currentUser.$id,
        createdByName: currentUser.name,
        participants: [currentUser.$id, ...participants],
        participantNames: [currentUser.name], // Will be updated when participants join
        isPrivate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const document = await databases.createDocument(
        DATABASE_ID,
        CHAT_ROOMS_COLLECTION_ID,
        ID.unique(),
        chatRoomData
      );

      // Add creator as admin participant
      await this.addParticipantToRoom(document.$id, currentUser.$id, currentUser.name, 'admin');

      // Add other participants as members
      for (const participantId of participants) {
        await this.addParticipantToRoom(document.$id, participantId, '', 'member');
      }      return {
        $id: document.$id,
        name: document.name,
        description: document.description,
        createdBy: document.createdBy,
        createdByName: document.createdByName,
        participants: document.participants,
        participantNames: document.participantNames,
        isPrivate: document.isPrivate,
        lastMessage: document.lastMessage,
        lastMessageTime: document.lastMessageTime ? new Date(document.lastMessageTime) : undefined,
        createdAt: new Date(document.createdAt),
        updatedAt: new Date(document.updatedAt),
      };
    } catch (error: any) {
      throw new Error(`Failed to create chat room: ${error.message}`);
    }
  }

  // Add participant to chat room
  static async addParticipantToRoom(
    chatRoomId: string,
    userId: string,
    userName: string,
    role: 'admin' | 'member' = 'member'
  ): Promise<ChatParticipant> {
    try {
      const participantData = {
        chatRoomId,
        userId,
        userName,
        role,
        joinedAt: new Date().toISOString(),
      };

      const document = await databases.createDocument(
        DATABASE_ID,
        CHAT_PARTICIPANTS_COLLECTION_ID,
        ID.unique(),
        participantData
      );      return {
        $id: document.$id,
        chatRoomId: document.chatRoomId,
        userId: document.userId,
        userName: document.userName,
        role: document.role,
        joinedAt: new Date(document.joinedAt),
      };
    } catch (error: any) {
      throw new Error(`Failed to add participant: ${error.message}`);
    }  }
  // Send a message to a chat room
  static async sendMessage(chatRoomId: string, message: string, messageType: 'text' | 'image' | 'system' | 'completion_photo' = 'text'): Promise<ChatMessage> {
    try {
      await this.ensureUserPermissions();
      const currentUser = await account.get();

      const messageData = {
        chatRoomId,
        senderId: currentUser.$id,
        senderName: currentUser.name,
        message,
        messageType,
        createdAt: new Date().toISOString(),
      };

      const document = await databases.createDocument(
        DATABASE_ID,
        CHAT_MESSAGES_COLLECTION_ID,
        ID.unique(),
        messageData
      );

      // Update chat room's last message
      await databases.updateDocument(
        DATABASE_ID,
        CHAT_ROOMS_COLLECTION_ID,
        chatRoomId,
        {
          lastMessage: message,
          lastMessageTime: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );      return {
        $id: document.$id,
        chatRoomId: document.chatRoomId,
        senderId: document.senderId,
        senderName: document.senderName,
        message: document.message,
        messageType: document.messageType,
        createdAt: new Date(document.createdAt),
      };
    } catch (error: any) {
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Get chat rooms for current user
  static async getUserChatRooms(): Promise<ChatRoom[]> {
    try {
      await this.ensureAuthenticated();
      const currentUser = await account.get();

      const response = await databases.listDocuments(
        DATABASE_ID,
        CHAT_ROOMS_COLLECTION_ID,
        [
          Query.contains('participants', currentUser.$id),
          Query.orderDesc('updatedAt'),
        ]
      );      return response.documents.map(doc => ({
        $id: doc.$id,
        name: doc.name,
        description: doc.description,
        createdBy: doc.createdBy,
        createdByName: doc.createdByName,
        participants: doc.participants,
        participantNames: doc.participantNames,
        isPrivate: doc.isPrivate,
        lastMessage: doc.lastMessage,
        lastMessageTime: doc.lastMessageTime ? new Date(doc.lastMessageTime) : undefined,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch chat rooms: ${error.message}`);
    }
  }

  // Get messages for a chat room
  static async getChatMessages(chatRoomId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      await this.ensureAuthenticated();

      const response = await databases.listDocuments(
        DATABASE_ID,
        CHAT_MESSAGES_COLLECTION_ID,
        [
          Query.equal('chatRoomId', chatRoomId),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
        ]
      );      return response.documents.map(doc => ({
        $id: doc.$id,
        chatRoomId: doc.chatRoomId,
        senderId: doc.senderId,
        senderName: doc.senderName,
        message: doc.message,
        messageType: doc.messageType,
        createdAt: new Date(doc.createdAt),
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  }

  // Get participants of a chat room
  static async getChatParticipants(chatRoomId: string): Promise<ChatParticipant[]> {
    try {
      const response = await databases.listDocuments(
        DATABASE_ID,
        CHAT_PARTICIPANTS_COLLECTION_ID,
        [Query.equal('chatRoomId', chatRoomId)]
      );      return response.documents.map(doc => ({
        $id: doc.$id,
        chatRoomId: doc.chatRoomId,
        userId: doc.userId,
        userName: doc.userName,
        role: doc.role,
        joinedAt: new Date(doc.joinedAt),
      }));
    } catch (error: any) {
      throw new Error(`Failed to fetch participants: ${error.message}`);
    }
  }
  // Join a chat room
  static async joinChatRoom(chatRoomId: string): Promise<void> {
    try {
      await this.ensureUserPermissions();
      const currentUser = await account.get();

      // Check if user is already a participant
      const existingParticipants = await this.getChatParticipants(chatRoomId);
      const isAlreadyParticipant = existingParticipants.some(p => p.userId === currentUser.$id);

      if (!isAlreadyParticipant) {
        await this.addParticipantToRoom(chatRoomId, currentUser.$id, currentUser.name, 'member');

        // Update chat room participants list
        const chatRoom = await databases.getDocument(DATABASE_ID, CHAT_ROOMS_COLLECTION_ID, chatRoomId);
        const updatedParticipants = [...chatRoom.participants, currentUser.$id];
        const updatedParticipantNames = [...chatRoom.participantNames, currentUser.name];

        await databases.updateDocument(
          DATABASE_ID,
          CHAT_ROOMS_COLLECTION_ID,
          chatRoomId,
          {
            participants: updatedParticipants,
            participantNames: updatedParticipantNames,
            updatedAt: new Date().toISOString(),
          }
        );
      }
    } catch (error: any) {
      throw new Error(`Failed to join chat room: ${error.message}`);
    }
  }

  // Delete a chat room and all its messages
  static async deleteChatRoom(chatRoomId: string): Promise<void> {
    try {
      await this.ensureUserPermissions();
      
      // Delete all messages in the chat room
      const messages = await this.getChatMessages(chatRoomId, 1000); // Get all messages
      for (const message of messages) {
        if (message.$id) {
          await databases.deleteDocument(DATABASE_ID, CHAT_MESSAGES_COLLECTION_ID, message.$id);
        }
      }

      // Delete all participants
      const participants = await this.getChatParticipants(chatRoomId);
      for (const participant of participants) {
        if (participant.$id) {
          await databases.deleteDocument(DATABASE_ID, CHAT_PARTICIPANTS_COLLECTION_ID, participant.$id);
        }
      }

      // Delete the chat room itself
      await databases.deleteDocument(DATABASE_ID, CHAT_ROOMS_COLLECTION_ID, chatRoomId);
    } catch (error: any) {
      throw new Error(`Failed to delete chat room: ${error.message}`);
    }
  }
}
