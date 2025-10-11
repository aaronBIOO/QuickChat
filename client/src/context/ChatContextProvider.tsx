import { useContext, useState, useEffect, useCallback } from "react";
import { toast } from "react-hot-toast";
import { AuthContext } from "@/context/AuthContext";
import { ChatContext } from "@/context/ChatContext";
import type { 
  AuthUser,
  User, 
  Message, 
  UnseenMessages, 
  MessageData, 
  SeenMessageData, 
  ChatContextType 
} from "@/types/chat.types";


export const ChatContextProvider = ({ children }: { children: React.ReactNode }) => {

  const [messages, setMessages] = useState<Message[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [unseenMessage, setUnseenMessage] = useState<UnseenMessages>({});

  const { socket, apiClient, authUser } = useContext(AuthContext) as {
    socket: {
      on: (event: 'newMessage', callback: (data: Message) => void) => void;
      off: (event: 'newMessage', callback?: (data: Message) => void) => void;
    } | null;

    apiClient: {
      get: <T>(url: string) => Promise<{ data: T & { success: boolean; message?: string } }>;
      post: <T>(url: string, data?: MessageData) => Promise<{ data: T & { success: boolean; message?: string } }>;
      put: <T>(url: string, data?: SeenMessageData) => Promise<{ data: T & { success: boolean; message?: string } }>;
    };
    authUser: AuthUser | null;
  };


  // get all users for sidebar
  const getUsers = useCallback(async () => {
    
    if (!authUser) return;

    try {
      const { data } = await apiClient.get<{ users: User[]; unseenMessages: Record<string, number> }>('/api/messages/users');
      console.log("getUsers response", data);
      if (!data?.success) {
        throw new Error(data?.message || 'Unexpected error fetching users');
      }

      if (data.users) {
        setUsers(data.users);
        console.log("Users stored in state:", data.users);
      }

      if (data.unseenMessages) {
        setUnseenMessage(data.unseenMessages);
        console.log("Unseen messages stored in state:", data.unseenMessages);
      }

    } catch (error) {
      toast.error('Error fetching users');
      console.error('Error fetching users:', error);
    }
  }, [apiClient, authUser, setUsers, setUnseenMessage]);

  useEffect(() => {
    if (authUser) {
      getUsers();
    }
    if (!authUser) {
      setUsers([]);
      setMessages([]);
      setSelectedUser(null);
      setUnseenMessage({});
    }
  }, [authUser, getUsers]);


  // get messages for selected user
  const getMessages = useCallback(async (userId: string) => {
    
    if (!authUser) return;

    try {
      const { data } = await apiClient.get<{ messages: Message[] }>(`/api/messages/users/${userId}`);
      if (!data?.success) {
        throw new Error(data?.message || 'Unexpected error fetching messages');
      }

      if (data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error('Error fetching messages');
      console.error('Error fetching messages:', error);
    }
  }, [apiClient, authUser, setMessages]);
  

  // send message to selected user
  const sendMessage = useCallback(async (messageData: MessageData) => {
    if (!selectedUser) {
      toast.error('No user selected');
      return;
    }
    
    if (!authUser) {
      toast.error('You must be logged in to send a message');
      return;
    }
    
    try {
      const { data } = await apiClient.post<{ newMessage: Message }>(`/api/messages/send/${selectedUser?._id}`, messageData);
      if (!data?.success) {
        throw new Error(data?.message || 'Unexpected error sending message');
      }

      if (data.newMessage) {
        setMessages((prevMessages) => [...prevMessages, data.newMessage as Message]);
      } else {
        if (data.message) {
          toast.error(data.message);
        }
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error sending message';
      toast.error(errorMessage);
      console.error('Error sending message:', error);
    }
  }, [apiClient, authUser, selectedUser, setMessages]);

  const markSeen = useCallback(async (id: string) => {
    
    if (!authUser) return;

    try {
      const { data } = await apiClient.put(`/api/messages/mark/${id}`);
      if (data.success) {
        setMessages(prev => prev.map(m => m._id === id ? { ...m, seen: true } : m));
      }
    } catch (err) {
      console.error('Error marking message seen:', err);
    }
  }, [apiClient, authUser]);


  // function to subscribe to messages for selected user
  const subscribeToMessages = useCallback(() => {
    if (!socket || !authUser) return;

    socket.on("newMessage", (newMessage: Message) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        markSeen(newMessage._id);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } else {
        setUnseenMessage(prev => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1
        }));
      }
    });
  }, [socket, selectedUser, markSeen, authUser]);


  // function to unsubscribe from messages
  const unsubscribeFromMessages = useCallback(() => {
    if (socket) {
      const offMethod = socket.off as (event: string, callback?: (data: Message) => void) => void;
      offMethod.call(socket, 'newMessage');
    }
  }, [socket]);

  useEffect(() => {
    subscribeToMessages();
    return () => {
      unsubscribeFromMessages();
    };
  }, [subscribeToMessages, unsubscribeFromMessages]);

  
  const value: ChatContextType = {
    messages,
    users,
    selectedUser,
    unseenMessage,
    getUsers,
    getMessages,
    sendMessage,
    markSeen,
    setSelectedUser,
    setUnseenMessage
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
