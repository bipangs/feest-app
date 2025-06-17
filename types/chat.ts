export interface ChatRoom {
  $id?: string;
  name: string;
  description?: string;
  createdBy: string;
  createdByName: string;
  participants: string[]; // Array of user IDs
  participantNames: string[]; // Array of user names
  isPrivate: boolean;
  lastMessage?: string;
  lastMessageTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  $id?: string;
  chatRoomId: string;
  senderId: string;
  senderName: string;
  message: string;
  messageType: 'text' | 'image' | 'system' | 'completion_photo';
  createdAt: Date;
}

export interface ChatParticipant {
  $id?: string;
  chatRoomId: string;
  userId: string;
  userName: string;
  joinedAt: Date;
  role: 'admin' | 'member';
}
