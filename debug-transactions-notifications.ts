import { Account, Client, Databases, Query } from 'react-native-appwrite';

const client = new Client();
client
  .setEndpoint('https://syd.cloud.appwrite.io/v1')
  .setProject('feest')
  .setPlatform('com.streetbyteid.feest');

const databases = new Databases(client);
const account = new Account(client);

const DATABASE_ID = '685060470025155bac52';
const NOTIFICATION_COLLECTION_ID = 'notification';
const TRANSACTIONS_COLLECTION_ID = 'transactions';

async function debugTransactionsAndNotifications() {
  try {
    console.log('🔍 Debug: Checking user authentication...');
    const currentUser = await account.get();
    console.log('✅ User authenticated:', currentUser.email, currentUser.$id);

    console.log('\n📋 Debug: Fetching user notifications...');
    try {
      const notificationResponse = await databases.listDocuments(
        DATABASE_ID,
        NOTIFICATION_COLLECTION_ID,
        [
          Query.equal('toUserId', currentUser.$id),
          Query.orderDesc('createdAt'),
        ]
      );
      console.log('📬 Total notifications found:', notificationResponse.total);
      console.log('📬 Notification documents:', notificationResponse.documents.length);
      
      if (notificationResponse.documents.length > 0) {
        console.log('📬 Sample notification:', notificationResponse.documents[0]);
      }
    } catch (notifError) {
      console.error('❌ Error fetching notifications:', notifError);
    }

    console.log('\n💰 Debug: Fetching user transactions...');
    try {
      // Get transactions where user is owner
      const ownerTransactions = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        [
          Query.equal('ownerId', currentUser.$id),
          Query.orderDesc('createdAt'),
          Query.limit(50)
        ]
      );
      
      // Get transactions where user is requester
      const requesterTransactions = await databases.listDocuments(
        DATABASE_ID,
        TRANSACTIONS_COLLECTION_ID,
        [
          Query.equal('requesterId', currentUser.$id),
          Query.orderDesc('createdAt'),
          Query.limit(50)
        ]
      );

      console.log('💰 Owner transactions found:', ownerTransactions.total);
      console.log('💰 Requester transactions found:', requesterTransactions.total);
      
      const allTransactions = [...ownerTransactions.documents, ...requesterTransactions.documents];
      console.log('💰 Total combined transactions:', allTransactions.length);
      
      if (allTransactions.length > 0) {
        console.log('💰 Sample transaction:', allTransactions[0]);
      }

      // Check for pending transactions
      const pendingOwner = ownerTransactions.documents.filter(t => t.status === 'pending');
      const pendingRequester = requesterTransactions.documents.filter(t => t.status === 'pending');
      console.log('⏳ Pending as owner:', pendingOwner.length);
      console.log('⏳ Pending as requester:', pendingRequester.length);

      // Check for accepted transactions
      const acceptedOwner = ownerTransactions.documents.filter(t => t.status === 'accepted');
      const acceptedRequester = requesterTransactions.documents.filter(t => t.status === 'accepted');
      console.log('✅ Accepted as owner:', acceptedOwner.length);
      console.log('✅ Accepted as requester:', acceptedRequester.length);

    } catch (transError) {
      console.error('❌ Error fetching transactions:', transError);
    }

    console.log('\n📊 Debug: Checking collections exist...');
    try {
      // Try to list with no filters to see if collections exist
      const notifTest = await databases.listDocuments(DATABASE_ID, NOTIFICATION_COLLECTION_ID, [Query.limit(1)]);
      console.log('📬 Notification collection exists, total docs:', notifTest.total);
      
      const transTest = await databases.listDocuments(DATABASE_ID, TRANSACTIONS_COLLECTION_ID, [Query.limit(1)]);
      console.log('💰 Transaction collection exists, total docs:', transTest.total);
    } catch (collectionError) {
      console.error('❌ Error checking collections:', collectionError);
    }

  } catch (error) {
    console.error('❌ Debug error:', error);
  }
}

export { debugTransactionsAndNotifications };

