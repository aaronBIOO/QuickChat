export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  token: string;
  avatar?: string;
  lastSeen?: string;
  status?: 'online' | 'offline' | 'away';
}

export interface User {
  _id: string;
  name: string;
  fullName?: string;
  email: string;
  avatar?: string;
  profilePic?: string;
  lastSeen?: string;
  status?: 'online' | 'offline' | 'away';
}

export interface Message {
  _id: string;
  content: string;
  senderId: string;
  receiverId: string;
  seen: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UnseenMessages {
  [key: string]: number;
}

export interface MessageData {
  content: string;
  type?: 'text' | 'image' | 'file';
  fileUrl?: string;
  fileName?: string;
}

export interface SeenMessageData {
  seen: boolean;
}

export interface ChatContextType {
  messages: Message[];
  users: User[];
  selectedUser: User | null;
  unseenMessage: UnseenMessages;
  getUsers: () => Promise<void>;
  getMessages: (userId: string) => Promise<void>;
  sendMessage: (messageData: MessageData) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
}
