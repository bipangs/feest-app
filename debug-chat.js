// Debug script to test chat functionality
import { ChatService } from './services/chatService.js';

console.log('Testing Chat Service...');

// Test basic connection
async function testChatService() {
  try {
    console.log('Testing getUserChatRooms...');
    const rooms = await ChatService.getUserChatRooms();
    console.log('Chat rooms:', rooms);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testChatService();
