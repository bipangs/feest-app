import { FoodService } from '@/services/foodService';
import { TransactionService } from '@/services/transactionService';

/**
 * Debug utility to test transaction functionality
 * Call this from a component to test if transactions are working
 */
export class TransactionDebugger {
  
  static async testDatabaseAccess() {
    console.log('🧪 Testing transaction database access...');
    
    try {
      // Test if we can list transactions (will fail if collection doesn't exist)
      const transactions = await TransactionService.getUserTransactions();
      console.log('✅ Transactions collection exists, found:', transactions.length, 'transactions');
      return { success: true, message: 'Database access working', transactions };
    } catch (error: any) {
      console.error('❌ Database access failed:', error);
      
      if (error.message.includes('Collection with the requested ID could not be found')) {
        return { 
          success: false, 
          message: 'TRANSACTIONS collection not found in database. Please create it first.',
          error: error.message 
        };
      }
      
      return { 
        success: false, 
        message: 'Database access error: ' + error.message,
        error: error.message 
      };
    }
  }
  
  static async testFoodItemAccess(foodItemId: string) {
    console.log('🧪 Testing food item access for:', foodItemId);
    
    try {
      const foodItem = await FoodService.getFoodItem(foodItemId);
      console.log('✅ Food item found:', foodItem.title);
      return { success: true, foodItem };
    } catch (error: any) {
      console.error('❌ Food item access failed:', error);
      return { success: false, error: error.message };
    }
  }
  
  static async runFullTest(foodItemId: string) {
    console.log('🧪 Running full transaction test...');
    
    // Test 1: Database access
    const dbTest = await this.testDatabaseAccess();
    if (!dbTest.success) {
      return dbTest;
    }
    
    // Test 2: Food item access
    const foodTest = await this.testFoodItemAccess(foodItemId);
    if (!foodTest.success) {
      return foodTest;
    }
    
    console.log('✅ All tests passed! Transaction system should work.');
    return { 
      success: true, 
      message: 'All tests passed',
      details: { dbTest, foodTest }
    };
  }
}
