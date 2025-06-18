import { Client, Databases } from 'react-native-appwrite';

const client = new Client();
client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('feest')
  .setPlatform('com.streetbyteid.feest');

const databases = new Databases(client);
const DATABASE_ID = '685060470025155bac52';

async function checkCollections() {
  try {
    console.log('📊 Checking available collections...');
    
    // Test specific collections mentioned in the error
    const collectionsToTest = [
      'transactions',
      'notification-history',
      'food-swap-notifications',
      'user_profiles',
      'food-items',
      'chat-rooms',
      'chat-messages'
    ];
    
    for (const collectionId of collectionsToTest) {
      try {
        const result = await databases.listDocuments(DATABASE_ID, collectionId, []);
        console.log(`✅ Collection '${collectionId}' exists with ${result.total} documents`);
      } catch (error: any) {
        console.log(`❌ Collection '${collectionId}' error:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error checking collections:', error);
  }
}

checkCollections();
