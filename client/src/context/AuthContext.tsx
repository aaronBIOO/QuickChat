import { createContext, useEffect, useState, useMemo, useCallback } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Socket, io } from "socket.io-client";
import { useUser, useAuth, useClerk } from "@clerk/clerk-react";

interface AuthUser {
  _id: string;
  email: string;
  fullName: string;
  bio?: string;
  profilePic?: string;
}

export interface AuthContextType {
  axios: typeof axios;
  authUser: AuthUser | null;
  onlineUsers: string[];
  socket: Socket | null;
  loading: boolean;
  updateProfile: (body: { fullName?: string; bio?: string; profilePic?: string }) => Promise<void>;
}


const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

axios.defaults.baseURL = backendUrl;
console.log("Backend URL being used:", backendUrl);
axios.defaults.withCredentials = false;

const AuthContext = createContext<AuthContextType | null>(null);
export { AuthContext };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { isSignedIn, isLoaded, user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const { signOut } = useClerk();
  
  // clerkUser to prevent unused variable warning
  console.log(clerkUser?.id);

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true); 


  // connect socket 
  const connectSocket = useCallback(async (userData: AuthUser | null) => {
    if (!userData || socket?.connected) return;

    const token = await getToken();

    const newSocket = io(backendUrl, {
      auth: { token: token || "" },
      withCredentials: true,
      transports: ["websocket"], 
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  
    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });
    
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });
  
    newSocket.on("getOnlineUsers", (userIds: string[]) => {
      setOnlineUsers(userIds);
    });
    
    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  
    setSocket(newSocket);
  }, [socket, getToken]);


  // update profile 
  const updateProfile = useCallback(async (body: { fullName?: string; bio?: string; profilePic?: string }) => {
    try {
      const { data } = await axios.put("/api/auth/user/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } 
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
      console.error(error);
    }
  }, [setAuthUser]);

  
  // axios interceptors 
  useEffect(() => {
    if (!isLoaded) return;

    const requestInterceptor = axios.interceptors.request.use(async (config) => {
      
      const clerkToken = await getToken(); 

      if (clerkToken) {
        config.headers.Authorization = `Bearer ${clerkToken}`;
      }

      return config;
    }, (error) => {
      return Promise.reject(error);
    });

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, [isLoaded, getToken]); 


  // User Sync and Socket Lifecycle Effect
  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setAuthUser(null);
      setSocket(null);
      setOnlineUsers([]);
      socket?.disconnect();
      setLoading(false);
      return;
    }

    const syncUserAndConnect = async () => {
      try {
        const { data } = await axios.get("/api/auth/user/sync"); 
        
        if (data.success) {
          setAuthUser(data.user);
          await connectSocket(data.user);
        }
      } catch (error) {
        console.error("Error syncing user with database:", error);
        signOut(); 
      } finally {
        setLoading(false);
      }
    };

    syncUserAndConnect();
    
    // Disconnect socket on cleanup
    return () => {
      socket?.disconnect();
      console.log("Socket disconnected on unmount or auth change");
    };
  }, [isLoaded, isSignedIn, connectSocket, signOut]); 

  
  const value: AuthContextType = useMemo(() => ({
    axios,
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
