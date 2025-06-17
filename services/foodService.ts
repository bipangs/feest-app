import { FoodItem, FoodRequest } from '@/types/food';
import { Account, Client, Databases, ID, Query, Storage } from 'react-native-appwrite';

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
const STORAGE_BUCKET_ID = 'food-images';

export class FoodService {
  // Ensure user is authenticated
  static async ensureAuthenticated(): Promise<void> {
    try {
      await account.get();
    } catch (error) {
      throw new Error('User not authenticated. Please log in and try again.');
    }
  }

  // Create a new food item
  static async createFoodItem(foodData: Omit<FoodItem, '$id' | 'createdAt' | 'updatedAt'>): Promise<FoodItem> {
    try {
      // Ensure user is authenticated before creating food item
      await this.ensureAuthenticated();
      
      const document = await databases.createDocument(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        ID.unique(),
        {
          ...foodData,
          expiryDate: foodData.expiryDate.toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
      return {
        ...document,
        expiryDate: new Date(document.expiryDate),
        createdAt: new Date(document.createdAt),
        updatedAt: new Date(document.updatedAt),
      } as unknown as FoodItem;
    } catch (error) {
      console.error('Error creating food item:', error);
      throw error;
    }
  }
  // Get all available food items
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
        expiryDate: new Date(doc.expiryDate),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      })) as unknown as FoodItem[];
    } catch (error) {
      console.error('Error fetching food items:', error);
      throw error;
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
        expiryDate: new Date(doc.expiryDate),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      })) as unknown as FoodItem[];
    } catch (error) {
      console.error('Error fetching user food items:', error);
      throw error;
    }
  }
  // Update food item status
  static async updateFoodItemStatus(foodId: string, status: FoodItem['status']): Promise<void> {
    try {
      // Ensure user is authenticated before updating
      await this.ensureAuthenticated();
      
      await databases.updateDocument(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        foodId,
        {
          status,
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      console.error('Error updating food item status:', error);
      throw error;
    }
  }

  // Delete food item
  static async deleteFoodItem(foodId: string): Promise<void> {
    try {
      // Ensure user is authenticated before deleting
      await this.ensureAuthenticated();
      
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
        ID.unique(),
        {
          name: fileName,
          type: blob.type,
          size: blob.size,
          uri: imageUri,
        }
      );
      
      return storage.getFileView(STORAGE_BUCKET_ID, file.$id).toString();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  // Create food request
  static async createFoodRequest(requestData: Omit<FoodRequest, '$id' | 'createdAt'>): Promise<FoodRequest> {
    try {
      // Ensure user is authenticated before creating request
      await this.ensureAuthenticated();
      
      const document = await databases.createDocument(
        DATABASE_ID,
        FOOD_REQUESTS_COLLECTION_ID,
        ID.unique(),
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
    }
  }
  // Update request status
  static async updateRequestStatus(requestId: string, status: FoodRequest['status']): Promise<void> {
    try {
      // Ensure user is authenticated before updating request
      await this.ensureAuthenticated();
      
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
  }
}
