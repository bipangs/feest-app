# Enhanced Authentication and User Features with CRUD Permissions

## Overview
The authentication system has been enhanced to include user labels and strict CRUD permissions. All create, update, and delete operations are now restricted to users with the "user" label only.

## Key Features Implemented

### 1. User Label System with CRUD Permissions
- **Always "user" label**: All new accounts are automatically assigned the "user" label during registration
- **User profile tracking**: Enhanced authentication context to track user profiles with labels
- **Strict CRUD permissions**: Only users with "user" label can perform create, update, delete operations
- **Role-based UI**: Interface adapts based on user permissions with clear messaging

### 2. Enhanced Food System with Permission Controls
- **Add Products**: Only users with "user" label can add new food items
- **Update/Delete**: Only users with "user" label can modify or delete food items
- **Request Food**: Only users with "user" label can request food from others
- **Visual Restrictions**: Non-user roles see disabled buttons and permission messages
- **Real-time Validation**: Form validation includes permission checks

### 3. Chat Room System with User Restrictions
- **Create Chat Rooms**: Only users with "user" label can create chat rooms
- **Send Messages**: Only users with "user" label can send messages
- **Join Rooms**: Only users with "user" label can join chat rooms
- **UI Adaptations**: Interface shows disabled state for non-user roles

## Permission Matrix

### CRUD Operations by Role

| Operation | User Label | Other Labels |
|-----------|------------|--------------|
| **Food Items** | | |
| Create Food | ✅ Allowed | ❌ Denied |
| Update Food Status | ✅ Allowed | ❌ Denied |
| Delete Food | ✅ Allowed | ❌ Denied |
| View Food | ✅ Allowed | ✅ Allowed |
| **Food Requests** | | |
| Create Request | ✅ Allowed | ❌ Denied |
| Update Request Status | ✅ Allowed | ❌ Denied |
| View Requests | ✅ Allowed | ✅ Allowed |
| **Chat System** | | |
| Create Chat Room | ✅ Allowed | ❌ Denied |
| Send Messages | ✅ Allowed | ❌ Denied |
| Join Chat Room | ✅ Allowed | ❌ Denied |
| View Chat Rooms | ✅ Allowed | ✅ Allowed |

## User Experience for Different Roles

### For "user" Label Accounts:
1. **Full Food Management**:
   - Create, edit, and delete food items
   - Request food from other users
   - Complete food transactions

2. **Complete Chat Access**:
   - Create new chat rooms
   - Send and receive messages
   - Join existing chat rooms

3. **Full CRUD Operations**:
   - All create, update, delete operations available
   - No restrictions on core functionality

### For Non-"user" Label Accounts:
1. **Read-Only Food Access**:
   - Can view food items and details
   - Cannot add, edit, or request food
   - See permission warning messages

2. **Limited Chat Access**:
   - Can view existing chat rooms
   - Cannot create rooms or send messages
   - Clear messaging about restrictions

3. **View-Only Permissions**:
   - All CRUD operations disabled
   - UI shows disabled state with explanations

## Technical Implementation

### Service Layer Security:
1. **FoodService**:
   - `ensureUserPermissions()`: Validates user label before any write operation
   - `ensureAuthenticated()`: Basic auth check for read operations
   - Applied to: createFoodItem, updateFoodItemStatus, deleteFoodItem, createFoodRequest, updateRequestStatus

2. **ChatService**:
   - `ensureUserPermissions()`: Validates user label before any write operation
   - `ensureAuthenticated()`: Basic auth check for read operations
   - Applied to: createChatRoom, sendMessage, joinChatRoom

### UI Layer Adaptations:
1. **FoodScreen**:
   - Add button disabled for non-users
   - Permission warnings in empty states
   - Role indicator in header

2. **AddFoodForm**:
   - Submit button disabled for non-users
   - Visual permission warning
   - Role display in header

3. **ChatScreen**:
   - Create room button disabled for non-users
   - Permission notes in user info
   - Conditional form rendering

4. **FoodItemCard**:
   - Request button only for users
   - Clear messaging for restricted access

## Error Handling

### Server-Side Validation:
- Permission checks throw descriptive error messages
- "Only users with 'user' label can perform this action."
- Graceful fallback to authentication errors

### Client-Side Prevention:
- UI prevents invalid actions before API calls
- Clear visual indicators for restrictions
- User-friendly permission messages

## Security Features
- **Multi-layer validation**: Both client and server-side permission checks
- **Role verification**: Real-time user profile validation
- **Descriptive errors**: Clear messaging about permission requirements
- **Fail-safe defaults**: All operations default to restricted unless explicitly allowed

This system ensures that only verified "user" label accounts can perform data modifications while maintaining a clear and informative user experience for all account types.
