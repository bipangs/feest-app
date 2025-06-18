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
const CHAT_MESSAGES_COLLECTION_ID = 'chat-message';
const CHAT_PARTICIPANTS_COLLECTION_ID = 'chat-participants';
const USER_PROFILES_COLLECTION_ID = 'user_profiles';

// Debug function to log collection operations
const debugLog = (operation: string, collectionId: string, error?: any) => {
  console.log(`[ChatService Debug] ${operation} - Collection: ${collectionId}`);
  console.log(`[ChatService Debug] Database ID: ${DATABASE_ID}`);
  if (error) {
    console.error(`[ChatService Error] ${operation} failed:`, error);
    console.error(`[ChatService Error] Collection ID used: ${collectionId}`);
  }
};

export class ChatService {  
  // Ensure user is authenticated
  static async ensureUserPermissions(): Promise<void> {
    try {
      console.log('[ChatService Debug] Checking user permissions...');
      await account.get();
    } catch (error) {
      console.error('[ChatService Debug] User authentication failed:', error);
      throw new Error('User not authenticated. Please log in and try again.');
    }
  }
  // Ensure user is authenticated (for read operations)
  static async ensureAuthenticated(): Promise<void> {
    try {
      console.log('[ChatService Debug] Checking user authentication...');
      await account.get();
    } catch (error) {
      console.error('[ChatService Debug] User authentication failed:', error);
      throw new Error('User not authenticated. Please log in and try again.');
    }
  }// Create a new chat room
  static async createChatRoom(
    name: string,
    description: string,
    isPrivate: boolean = false,
    participants: string[] = []
  ): Promise<ChatRoom> {
    try {
      debugLog('Creating chat room', CHAT_ROOMS_COLLECTION_ID);
      await this.ensureUserPermissions();
      const currentUser = await account.get();

      // Get participant names
      const participantNames = [currentUser.name];
      for (const participantId of participants) {        if (participantId !== currentUser.$id) {          try {
            debugLog('Fetching user profile', USER_PROFILES_COLLECTION_ID);
            // Get user profile directly by document ID (since documentId = userId)
            const userProfile = await databases.getDocument(
              DATABASE_ID,
              USER_PROFILES_COLLECTION_ID,
              participantId
            );
            participantNames.push(userProfile.fullName || userProfile.name || userProfile.email || 'Unknown User');
          } catch (error) {
            debugLog('Failed to fetch user profile', USER_PROFILES_COLLECTION_ID, error);
            console.warn('Could not fetch participant name for:', participantId);
            participantNames.push('Unknown User');
          }
        }
      }

      const chatRoomData = {
        name,
        description,
        createdBy: currentUser.$id,
        createdByName: currentUser.name,
        participants: [currentUser.$id, ...participants],
        participantNames,
        isPrivate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };      const document = await databases.createDocument(
        DATABASE_ID,
        CHAT_ROOMS_COLLECTION_ID,
        ID.unique(),
        chatRoomData
      );

      debugLog('Chat room created successfully', CHAT_ROOMS_COLLECTION_ID);

      // Add creator as admin participant
      await this.addParticipantToRoom(document.$id, currentUser.$id, currentUser.name, 'admin');

      // Add other participants as members
      for (let i = 0; i < participants.length; i++) {
        const participantId = participants[i];
        const participantName = participantNames[i + 1] || 'Unknown User'; // +1 because creator is at index 0
        await this.addParticipantToRoom(document.$id, participantId, participantName, 'member');
      }return {
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
        createdAt: new Date(document.createdAt),        updatedAt: new Date(document.updatedAt),
      };
    } catch (error: any) {
      debugLog('Create chat room failed', CHAT_ROOMS_COLLECTION_ID, error);
      throw new Error(`Failed to create chat room: ${error.message}`);
    }
  }  // Add participant to chat room
  static async addParticipantToRoom(
    chatRoomId: string,
    userId: string,
    userName: string,
    role: 'admin' | 'member' = 'member'
  ): Promise<ChatParticipant> {
    try {
      debugLog('Adding participant to room', CHAT_PARTICIPANTS_COLLECTION_ID);
      console.log(`[ChatService Debug] Adding user ${userId} (${userName}) to room ${chatRoomId} as ${role}`);
      
      const participantData = {
        chatRoomId,
        userId,
        userName,
        role,
        joinedAt: new Date().toISOString(),
      };const document = await databases.createDocument(
        DATABASE_ID,
        CHAT_PARTICIPANTS_COLLECTION_ID,
        ID.unique(), // Use unique ID instead of userId
        participantData
      );

      debugLog('Participant added successfully', CHAT_PARTICIPANTS_COLLECTION_ID);
      console.log(`[ChatService Debug] Participant document created with ID: ${document.$id}`);
      
      return {
        $id: document.$id,
        chatRoomId: document.chatRoomId,
        userId: document.userId,
        userName: document.userName,
        role: document.role,        joinedAt: new Date(document.joinedAt),
      };
    } catch (error: any) {
      debugLog('Add participant failed', CHAT_PARTICIPANTS_COLLECTION_ID, error);
      throw new Error(`Failed to add participant: ${error.message}`);
    }  }  // Send a message to a chat room
  static async sendMessage(chatRoomId: string, message: string, messageType: 'text' | 'image' | 'system' | 'completion_photo' = 'text'): Promise<ChatMessage> {
    try {
      debugLog('Sending message', CHAT_MESSAGES_COLLECTION_ID);
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

      debugLog('Message created successfully', CHAT_MESSAGES_COLLECTION_ID);

      // Update chat room's last message
      debugLog('Updating chat room last message', CHAT_ROOMS_COLLECTION_ID);
      await databases.updateDocument(
        DATABASE_ID,
        CHAT_ROOMS_COLLECTION_ID,
        chatRoomId,
        {
          lastMessage: message,
          lastMessageTime: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );return {
        $id: document.$id,
        chatRoomId: document.chatRoomId,
        senderId: document.senderId,
        senderName: document.senderName,
        message: document.message,
        messageType: document.messageType,        createdAt: new Date(document.createdAt),
      };
    } catch (error: any) {
      debugLog('Send message failed', CHAT_MESSAGES_COLLECTION_ID, error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }
  // Get chat rooms for current user
  static async getUserChatRooms(): Promise<ChatRoom[]> {
    try {
      debugLog('Fetching user chat rooms', CHAT_ROOMS_COLLECTION_ID);
      await this.ensureAuthenticated();
      const currentUser = await account.get();      const response = await databases.listDocuments(
        DATABASE_ID,
        CHAT_ROOMS_COLLECTION_ID,
        [
          Query.contains('participants', currentUser.$id),
          Query.orderDesc('updatedAt'),
        ]
      );      

      debugLog(`Found ${response.documents.length} chat rooms`, CHAT_ROOMS_COLLECTION_ID);

      return response.documents.map(doc => ({
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
        createdAt: new Date(doc.createdAt),        updatedAt: new Date(doc.updatedAt),
      }));
    } catch (error: any) {
      debugLog('Fetch chat rooms failed', CHAT_ROOMS_COLLECTION_ID, error);
      throw new Error(`Failed to fetch chat rooms: ${error.message}`);
    }
  }
  // Get messages for a chat room
  static async getChatMessages(chatRoomId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      debugLog('Fetching chat messages', CHAT_MESSAGES_COLLECTION_ID);
      await this.ensureAuthenticated();      const response = await databases.listDocuments(
        DATABASE_ID,
        CHAT_MESSAGES_COLLECTION_ID,
        [
          Query.equal('chatRoomId', chatRoomId),
          Query.orderDesc('createdAt'),
          Query.limit(limit),
        ]
      );      

      debugLog(`Found ${response.documents.length} messages`, CHAT_MESSAGES_COLLECTION_ID);

      return response.documents.map(doc => ({
        $id: doc.$id,
        chatRoomId: doc.chatRoomId,
        senderId: doc.senderId,
        senderName: doc.senderName,
        message: doc.message,
        messageType: doc.messageType,        createdAt: new Date(doc.createdAt),
      }));
    } catch (error: any) {
      debugLog('Fetch messages failed', CHAT_MESSAGES_COLLECTION_ID, error);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  }
  // Get participants of a chat room
  static async getChatParticipants(chatRoomId: string): Promise<ChatParticipant[]> {
    try {
      debugLog('Fetching chat participants', CHAT_PARTICIPANTS_COLLECTION_ID);
      const response = await databases.listDocuments(
        DATABASE_ID,
        CHAT_PARTICIPANTS_COLLECTION_ID,
        [Query.equal('chatRoomId', chatRoomId)]
      );      

      debugLog(`Found ${response.documents.length} participants`, CHAT_PARTICIPANTS_COLLECTION_ID);

      return response.documents.map(doc => ({
        $id: doc.$id,
        chatRoomId: doc.chatRoomId,
        userId: doc.userId,
        userName: doc.userName,
        role: doc.role,        joinedAt: new Date(doc.joinedAt),
      }));
    } catch (error: any) {
      debugLog('Fetch participants failed', CHAT_PARTICIPANTS_COLLECTION_ID, error);
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

      // Delete the chat room itself
      await databases.deleteDocument(DATABASE_ID, CHAT_ROOMS_COLLECTION_ID, chatRoomId);    } catch (error: any) {
      throw new Error(`Failed to delete chat room: ${error.message}`);
    }
  }

  // Get a specific chat room by ID
  static async getChatRoomById(chatRoomId: string): Promise<ChatRoom> {
    try {
      debugLog('Fetching chat room by ID', CHAT_ROOMS_COLLECTION_ID);
      await this.ensureAuthenticated();

      const document = await databases.getDocument(
        DATABASE_ID,
        CHAT_ROOMS_COLLECTION_ID,
        chatRoomId
      );

      debugLog('Chat room found successfully', CHAT_ROOMS_COLLECTION_ID);

      return {
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
        foodItemId: document.foodItemId,
        chatType: document.chatType,
        createdAt: new Date(document.createdAt),        updatedAt: new Date(document.updatedAt),
      };
    } catch (error: any) {
      debugLog('Fetch chat room by ID failed', CHAT_ROOMS_COLLECTION_ID, error);
      throw new Error(`Failed to fetch chat room: ${error.message}`);
    }
  }  // Check if user is a participant in a chat room
  static async isUserParticipant(chatRoomId: string, userId: string): Promise<boolean> {
    try {
      debugLog('Checking if user is participant', CHAT_PARTICIPANTS_COLLECTION_ID);
      await this.ensureAuthenticated();
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        CHAT_PARTICIPANTS_COLLECTION_ID,
        [
          Query.equal('chatRoomId', chatRoomId),
          Query.equal('userId', userId)
        ]
      );
      
      const isParticipant = response.documents.length > 0;
      debugLog(`User is ${isParticipant ? '' : 'not '}participant`, CHAT_PARTICIPANTS_COLLECTION_ID);
      return isParticipant;
    } catch (error) {
      debugLog('Error checking participant status', CHAT_PARTICIPANTS_COLLECTION_ID, error);
      return false;
    }
  }

  // Remove participant from chat room
  static async removeParticipantFromRoom(chatRoomId: string, userId: string): Promise<void> {    try {
      await this.ensureUserPermissions();
      
      // Find the participant document first
      const participantResponse = await databases.listDocuments(
        DATABASE_ID,
        CHAT_PARTICIPANTS_COLLECTION_ID,
        [
          Query.equal('chatRoomId', chatRoomId),
          Query.equal('userId', userId)
        ]
      );

      // Remove participant document if found
      if (participantResponse.documents.length > 0) {
        await databases.deleteDocument(
          DATABASE_ID,
          CHAT_PARTICIPANTS_COLLECTION_ID,
          participantResponse.documents[0].$id
        );
      }

      // Update chat room participants array
      const chatRoom = await this.getChatRoomById(chatRoomId);
      const updatedParticipants = chatRoom.participants.filter(id => id !== userId);
      const userIndex = chatRoom.participants.indexOf(userId);
      const updatedParticipantNames = chatRoom.participantNames.filter((_, index) => index !== userIndex);

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
    } catch (error: any) {
      throw new Error(`Failed to remove participant: ${error.message}`);
    }
  }
  // Get participant details by userId and chatRoomId
  static async getParticipant(chatRoomId: string, userId: string): Promise<ChatParticipant | null> {
    try {
      await this.ensureAuthenticated();
      
      const response = await databases.listDocuments(
        DATABASE_ID,
        CHAT_PARTICIPANTS_COLLECTION_ID,
        [
          Query.equal('chatRoomId', chatRoomId),
          Query.equal('userId', userId)
        ]
      );

      if (response.documents.length === 0) {
        return null;
      }

      const document = response.documents[0];
      return {
        $id: document.$id,
        chatRoomId: document.chatRoomId,
        userId: document.userId,
        userName: document.userName,
        role: document.role,
        joinedAt: new Date(document.joinedAt),
      };
    } catch (error) {      
      return null;
    }
  }

  // Debug method to check if all required collections exist
  static async checkCollections(): Promise<void> {
    console.log('[ChatService Debug] Checking all required collections...');
    console.log(`[ChatService Debug] Database ID: ${DATABASE_ID}`);
    
    const collections = [
      { name: 'Chat Rooms', id: CHAT_ROOMS_COLLECTION_ID },
      { name: 'Chat Messages', id: CHAT_MESSAGES_COLLECTION_ID },
      { name: 'Chat Participants', id: CHAT_PARTICIPANTS_COLLECTION_ID },
      { name: 'User Profiles', id: USER_PROFILES_COLLECTION_ID }
    ];

    for (const collection of collections) {
      try {
        const response = await databases.listDocuments(
          DATABASE_ID,
          collection.id,
          [Query.limit(1)]
        );
        console.log(`✅ [ChatService Debug] ${collection.name} (${collection.id}) - OK (${response.total} documents)`);
      } catch (error: any) {
        console.error(`❌ [ChatService Debug] ${collection.name} (${collection.id}) - MISSING OR ERROR:`, error.message);
        console.error(`[ChatService Debug] Error details:`, error);
      }
    }
  }

  // Create a transaction chat room
  static async createTransactionChatRoom(
    transactionId: string,
    transactionType: string,
    buyerId: string,
    buyerName: string,
    sellerId: string,
    sellerName: string,
    itemTitle?: string
  ): Promise<ChatRoom> {
    try {
      await this.ensureUserPermissions();

      const chatRoomName = itemTitle 
        ? `Transaction: ${itemTitle}` 
        : `${transactionType} Transaction`;
      const description = `Transaction discussion between ${buyerName} and ${sellerName}`;

      const chatRoomData = {
        name: chatRoomName,
        description,
        createdBy: buyerId,
        createdByName: buyerName,
        participants: [buyerId, sellerId],
        participantNames: [buyerName, sellerName],
        isPrivate: true,
        transactionId, // Add transaction reference
        chatType: 'transaction', // Mark as transaction chat
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      debugLog('Creating transaction chat room', CHAT_ROOMS_COLLECTION_ID);
      const document = await databases.createDocument(
        DATABASE_ID,
        CHAT_ROOMS_COLLECTION_ID,
        ID.unique(),
        chatRoomData
      );

      // Add both participants to the room
      await this.addParticipantToRoom(document.$id, buyerId, buyerName, 'member');
      await this.addParticipantToRoom(document.$id, sellerId, sellerName, 'member');

      // Send initial system message about the transaction
      await this.sendMessage(
        document.$id,
        `Transaction chat created between ${buyerName} and ${sellerName}`,
        'system'
      );

      return {
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
      debugLog('Create transaction chat room failed', CHAT_ROOMS_COLLECTION_ID, error);
      throw new Error(`Failed to create transaction chat room: ${error.message}`);
    }
  }
}
