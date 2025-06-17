export interface FoodItem {
  $id?: string;
  title: string;
  description: string;
  imageUri: string;
  expiryDate: Date;
  status: 'available' | 'requested' | 'completed';
  ownerId: string;
  ownerName: string;
  location?: string;
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
