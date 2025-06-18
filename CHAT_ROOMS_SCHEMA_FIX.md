# Chat Rooms Schema Corrections

## Current Issues with Your Schema

### 1. **Array Fields Incorrectly Set as String**
- `participants` should be **Array of Strings**, not String
- `participantNames` should be **Array of Strings**, not String

### 2. **Missing Required Fields**
Your schema is missing these fields that the code uses:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `foodItemId` | String | No | - | Reference to food item for food swap chats |
| `chatType` | String | No | - | Type of chat ('food_swap', 'general', etc.) |

## Corrected Schema

Here's what your chat-rooms collection schema should look like:

| Key | Type | Required | Default | Description |
|-----|------|----------|---------|-------------|
| `name` | String | Yes | - | Chat room name |
| `description` | String | No | - | Chat room description |
| `createdBy` | String | Yes | - | User ID who created the room |
| `createdByName` | String | Yes | - | Name of creator |
| `isPrivate` | Boolean | No | true | Whether chat is private |
| `lastMessage` | String | No | - | Last message content |
| `lastMessageTime` | Datetime | No | - | When last message was sent |
| `createdAt` | Datetime | Yes | - | When room was created |
| `updatedAt` | Datetime | No | - | When room was last updated |
| `participants` | **Array** | Yes | - | **Array of user IDs** |
| `participantNames` | **Array** | Yes | - | **Array of user names** |
| `foodItemId` | String | No | - | Food item reference for swap chats |
| `chatType` | String | No | - | Type of chat (food_swap, general) |

## Critical Changes Needed

1. **Change `participants` from String to Array**
2. **Change `participantNames` from String to Array**  
3. **Add `foodItemId` as String (optional)**
4. **Add `chatType` as String (optional)**

Without these changes, the chat room creation will fail because the code is trying to store arrays in string fields.
