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

  const { socket, axios, authUser } = useContext(AuthContext) as {
    socket: {
      on: (event: 'newMessage', callback: (data: Message) => void) => void;
      off: (event: 'newMessage', callback?: (data: Message) => void) => void;
    } | null;
    axios: {
      get: <T>(url: string) => Promise<{ data: T & { success: boolean; message?: string } }>;
      post: <T>(url: string, data?: MessageData) => Promise<{ data: T & { success: boolean; message?: string } }>;
      put: <T>(url: string, data?: SeenMessageData) => Promise<{ data: T & { success: boolean; message?: string } }>;
    };
    authUser: AuthUser | null;
  };


  // get all users for sidebar
  const getUsers = useCallback(async () => {
    try {
      const { data } = await axios.get<{ users: User[]; unseenMessage: Record<string, number> }>('/api/messages/users');
      if (data.success && data.users && data.unseenMessage) {
        setUsers(data.users);
        setUnseenMessage(data.unseenMessage);
      }

    } catch (error) {
      toast.error('Error fetching users');
      console.error('Error fetching users:', error);
    }
  }, [axios, setUsers, setUnseenMessage]);

  useEffect(() => {
    getUsers();
  }, [authUser, getUsers]);


  // get messages for selected user
  const getMessages = useCallback(async (userId: string) => {
    try {
      const { data } = await axios.get<{ messages: Message[] }>(`/api/messages/users/${userId}`);
      if (data.success && data.messages) {
        setMessages(data.messages);
      }
    } catch (error) {
      toast.error('Error fetching messages');
      console.error('Error fetching messages:', error);
    }
  }, [axios, setMessages]);
  


  // send message
  const sendMessage = useCallback(async (messageData: MessageData) => {
    if (!selectedUser) {
      toast.error('No user selected');
      return;
    }
    try {
      const { data } = await axios.post<{ newMessage: Message }>(`/api/messages/send/${selectedUser?._id}`, messageData);
      if (data.success && data.newMessage) {
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
  }, [axios, selectedUser, setMessages]);


  // function to subscribe to messages for selected user
  const subscribeToMessages = useCallback(() => {
    if (!socket) return;

    socket.on("newMessage", (newMessage: Message) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        newMessage.seen = true;
        setMessages((prevMessages) => [...prevMessages, newMessage]);
        axios.put(`/api/messages/mark/${newMessage._id}`);
      } else {
        setUnseenMessage((prevUnseenMessages) => ({
          ...prevUnseenMessages, [newMessage.senderId]:
          prevUnseenMessages[newMessage.senderId] ? prevUnseenMessages[newMessage.senderId] + 1 : 1
        }));
      }
    });
  }, [axios, selectedUser, setMessages, setUnseenMessage, socket]);


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
    setSelectedUser
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
