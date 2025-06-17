export interface Event {
  $id?: string;
  title: string;
  description: string;
  organizerId: string;
  organizerName: string;
  location: string;
  eventDate: Date;
  maxParticipants?: number;
  participantIds: string[];
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  imageUri?: string;
  latitude?: number;
  longitude?: number;
  category?: EventCategory;
  createdAt: Date;
  updatedAt: Date;
}

export type EventCategory = 
  | 'community-meal'
  | 'food-sharing'
  | 'cooking-class'
  | 'potluck'
  | 'garden-harvest'
  | 'food-rescue'
  | 'cultural-food'
  | 'other';
