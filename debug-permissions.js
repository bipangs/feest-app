const { Client, Databases, Account } = require('react-native-appwrite');

const client = new Client();
client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('feest')
  .setPlatform('com.streetbyteid.feest');

const databases = new Databases(client);
const account = new Account(client);
const DATABASE_ID = '685060470025155bac52';

async function debugPermissions() {
  try {
    console.log('🔍 Checking Appwrite collections and permissions...');
    
    // First, try to get session info without authentication
    try {
      const user = await account.get();
      console.log('✅ User authenticated:', user.email, 'ID:', user.$id);
    } catch (error) {
      console.log('❌ No authenticated user:', error.message);
      return;
    }
    
    // Test specific collections mentioned in the error
    const collectionsToTest = [
      'notification',
      'transactions', 
      'user_profiles',
      'food-items'
    ];
    
    for (const collectionId of collectionsToTest) {
      try {
        const result = await databases.listDocuments(DATABASE_ID, collectionId, []);
        console.log(`✅ Collection '${collectionId}' exists with ${result.total} documents`);
        
        // Try to create a test document to check write permissions
        try {
          const testDoc = await databases.createDocument(
            DATABASE_ID,
            collectionId,
            'test-permission-check',
            { test: 'permission check' }
          );
          console.log(`✅ Write permission works for '${collectionId}'`);
          
          // Clean up test document
          await databases.deleteDocument(DATABASE_ID, collectionId, 'test-permission-check');
        } catch (writeError) {
          console.log(`❌ Write permission failed for '${collectionId}':`, writeError.message);
        }
        
      } catch (error) {
        console.log(`❌ Collection '${collectionId}' error:`, error.message);
      }
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

debugPermissions();
