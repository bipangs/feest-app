export interface Transaction {
  $id?: string;
  foodItemId: string;
  foodTitle: string;
  ownerId: string;
  ownerName: string;
  requesterId: string;
  requesterName: string;
  chatRoomId?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  requestMessage?: string;
  completionPhoto?: string; // Base64 or URI to completion selfie
  requestedDate: Date;
  acceptedDate?: Date;
  completedDate?: Date;
  chatExpiresAt?: Date; // Chat will be disposed 6 hours after completion
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionMessage {
  $id?: string;
  transactionId: string;
  senderId: string;
  senderName: string;
  message: string;
  messageType: 'text' | 'image' | 'system' | 'completion_photo';
  timestamp: Date;
}

export interface CompletionProof {
  $id?: string;
  transactionId: string;
  photoUri: string;
  takenAt: Date;
  uploadedBy: string;
}

export type TransactionStatus = Transaction['status'];
