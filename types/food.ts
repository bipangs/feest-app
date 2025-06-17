export interface FoodItem {
  $id?: string;
  title: string;
  description: string;
  imageUri: string;
  expiryDate: Date;
  status: 'available' | 'requested' | 'completed';
  ownerId: string;
  ownerName: string;
  location?: string; // Human-readable address
  locationIP: string; // IP address for location lookup (required)
  latitude?: number; // Derived from IP or GPS
  longitude?: number; // Derived from IP or GPS
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FoodRequest {
  $id?: string;
  foodItemId: string;
  requesterId: string;
  requesterName: string;
  message?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export type FoodCategory = 
  | 'fruits'
  | 'vegetables'
  | 'grains'
  | 'dairy'
  | 'meat'
  | 'baked-goods'
  | 'prepared-meals'
  | 'beverages'
  | 'other';

export interface FoodSwap {
  $id?: string;
  foodItemId: string;
  ownerId: string;
  ownerName: string;
  requesterId: string;
  requesterName: string;
  status: 'pending' | 'accepted' | 'completed' | 'cancelled';
  requestedDate: Date;
  acceptedDate?: Date;
  completedDate?: Date;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserHistory {
  foodListings: FoodItem[];
  ongoingSwaps: FoodSwap[];
  completedSwaps: FoodSwap[];
  attendedEvents: string[]; // Event IDs
}
