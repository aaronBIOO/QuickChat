import { createContext, useEffect, useState, useMemo, useCallback } from 'react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import { Socket, io } from 'socket.io-client';
import { useUser, useClerk, useAuth } from '@clerk/clerk-react';
import apiClient from '@/lib/apiClient';

interface AuthUser {
  _id: string;
  email: string;
  fullName: string;
  bio?: string;
  profilePic?: string;
}

export interface AuthContextType {
  apiClient: typeof apiClient;
  authUser: AuthUser | null;
  onlineUsers: string[];
  socket: Socket | null;
  loading: boolean;
  updateProfile: (body: { fullName?: string; bio?: string; profilePic?: string }) => Promise<void>;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();
  
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);

  
  // Add token to all requests
  useEffect(() => {
    if (!isLoaded) return;

    const requestInterceptor = apiClient.interceptors.request.use(
      async (config) => {
        const token = await getToken({ skipCache: true });
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, [isLoaded, getToken]);


  // Connect socket and handle WebSocket events
  const connectSocket = useCallback(async (userData: AuthUser | null) => {
    if (!userData || socket?.connected) return;

    try {
      const newSocket = io(backendUrl, {
        withCredentials: true,
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });
      
      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });
    
      newSocket.on('getOnlineUsers', (userIds: string[]) => {
        setOnlineUsers(userIds);
      });
      
      newSocket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      setSocket(newSocket);
      return newSocket;
    } catch (error) {
      console.error('Failed to connect socket:', error);
      return null;
    }
  }, [socket]);


  // Update user profile
  const updateProfile = useCallback(async (body: { fullName?: string; bio?: string; profilePic?: string }) => {
    try {
      const { data } = await apiClient.put('/api/user/update-profile', body);
      if (data.success) {
        setAuthUser(prev => ({
          ...prev!,
          ...body
        }));
        toast.success('Profile updated successfully');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
      console.error('Update profile error:', error);
    }
  }, []);


  // User sync and socket lifecycle
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setAuthUser(null);
      setSocket(prevSocket => {
        prevSocket?.disconnect();
        return null;
      });
      setOnlineUsers([]);
      setLoading(false);
      return;
    }

    const syncUserAndConnect = async () => {
      try {
        const { data } = await apiClient.get('/api/sync');
        
        if (data.success) {
          setAuthUser(data.user);
          await connectSocket(data.user);
        }
      } catch (error) {
        console.error('Error syncing user with database:', error);
        signOut();
      } finally {
        setLoading(false);
      }
    };

    syncUserAndConnect();

    return () => {
      socket?.disconnect();
    };
  }, [isLoaded, isSignedIn, connectSocket, signOut, socket]);

  const value: AuthContextType = useMemo(() => ({
    apiClient,
    authUser,
    onlineUsers,
    socket,
    loading,
    updateProfile,
  }), [authUser, onlineUsers, socket, loading, updateProfile]);

  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
