import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Socket, io } from "socket.io-client";


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
  login: (state: 'login' | 'signup', credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (body: { fullName?: string; bio?: string; profilePic?: string }) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true;

const AuthContext = createContext<AuthContextType | null>(null);
export { AuthContext };

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    checkAuth();
  
    return () => {
      socket?.disconnect();
      console.log("Socket disconnected on unmount or auth change");
    };
  }, [authUser]);


  // user authentication check
  const checkAuth = async (): Promise<void> => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user)
        connectSocket(data.user)
      } else {
        setAuthUser(null);
      }
    } catch (error: unknown) {
      setAuthUser(null);

      if (axios.isAxiosError(error) 
        && error.response?.data.message === "Session expired. Please log in again.") {
        await logout();
        toast.error("Session expired. Please log in again.");
        return;
      }
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  }


  // login 
  const login = async (state: string, credentials: { email: string; password: string }) => {
    try {
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.user);
        connectSocket(data.user);
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
      console.error(error);
    }
  }


  // logout 
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setAuthUser(null);
      setSocket(null);
      setOnlineUsers([]);
      socket?.disconnect();
      toast.success("Logged out successfully");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
      console.error(error);
    }
  }

 
  // update profile 
  const updateProfile = async (body: { fullName?: string; bio?: string; profilePic?: string }) => {
    try {
      const { data } = await axios.put("/api/auth/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      } 
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
      console.error(error);
    }
  }

  
  // connect socket 
  const connectSocket = (userData: AuthUser | null) => {
    if (!userData || socket?.connected) return;
    
    const token = localStorage.getItem("token") || "";

    const newSocket = io(backendUrl, {
      auth: { token },
      withCredentials: true,
      transports: ["websocket"], 
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
  
    newSocket.on("authError", (error) => {
      console.error("Socket Auth Error:", error);
    });
    
    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });
  
    newSocket.on("getOnlineUsers", (userIds: string[]) => {
      setOnlineUsers(userIds);
    });
  
    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });
    
    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });
  
    setSocket(newSocket);
  }


  const value: AuthContextType = {
    axios,
    authUser,
    onlineUsers,
    socket,
    loading,
    login,
    logout,
    updateProfile,
    checkAuth,
  }

  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
