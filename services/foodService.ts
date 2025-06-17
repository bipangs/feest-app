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
const USER_PROFILES_COLLECTION_ID = 'user-profiles';
const STORAGE_BUCKET_ID = 'food-images';

export class FoodService {  // Ensure user is authenticated
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
  }  // Create a new food item
  static async createFoodItem(foodData: Omit<FoodItem, '$id' | 'createdAt' | 'updatedAt'>): Promise<FoodItem> {
    try {
      // Ensure user is authenticated before creating food item
      await this.ensureUserPermissions();
      
      // Get current user to set as owner
      const currentUser = await account.get();
        const document = await databases.createDocument(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        ID.unique(),
        {
          ...foodData,
          ownerId: currentUser.$id, // Set the creator as owner
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
  }  // Get all available food items
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
        expiryDate: new Date(doc.expiryDate),
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      })) as unknown as FoodItem[];
    } catch (error) {
      console.error('Error fetching user food items:', error);
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
        foodId
      );
      
      // Check if current user is the owner
      if (foodItem.ownerId !== currentUser.$id) {
        throw new Error('Only the owner can update this food item.');
      }
      
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
  }  // Delete food item (only owner can delete)
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
        ID.unique(),
        {
          name: fileName,
          type: blob.type,
          size: blob.size,
          uri: imageUri,
        }
      );
        // Return a public view URL for the uploaded image with proper project permissions
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
  }

  // Check if current user is owner of a food item
  static async isOwner(foodId: string): Promise<boolean> {
    try {
      const currentUser = await account.get();
      const foodItem = await databases.getDocument(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        foodId
      );
      return foodItem.ownerId === currentUser.$id;
    } catch (error) {
      console.error('Error checking ownership:', error);
      return false;
    }
  }

  // Get a single food item by ID
  static async getFoodItem(foodItemId: string): Promise<FoodItem> {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        FOOD_COLLECTION_ID,
        foodItemId
      );
      
      return {
        ...response,
        expiryDate: new Date(response.expiryDate),
        createdAt: new Date(response.createdAt),
        updatedAt: new Date(response.updatedAt),
      } as unknown as FoodItem;
    } catch (error) {
      console.error('Error fetching food item:', error);
      throw error;
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
