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
  text?: string;         
  image?: string;        
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
  content?: string;  
  text?: string;     
  image?: string;    
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
  getMessages: (id: string) => Promise<void>;
  sendMessage: (message: MessageData) => Promise<void>;
  markSeen: (id: string) => Promise<void>;
  setSelectedUser: (user: User | null) => void;
  setUnseenMessage: React.Dispatch<React.SetStateAction<UnseenMessages>>;
}
