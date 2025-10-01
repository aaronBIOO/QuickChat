import { createContext, useState } from "react";
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


  // check if user is authenticated and if so, set user data and connect socket
  const checkAuth = async (): Promise<void> => {
    try {
      const { data } = await axios.get("/api/auth/check");
      if (data.success) {
        setAuthUser(data.user)
        connectSocket(data.user)
      }
    } catch (error: unknown) {
      setAuthUser(null);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(errorMessage);
      console.error(error);
    }
  }


  // login function to handle user authentication and socket connection
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


  // logout function to handle user logout and socket disconnection
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

 
  // update profile function to handle user profile update
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

  
  // connect socket function to handle socket connection and online users updates
  const connectSocket = (userData: AuthUser | null) => {
    if (!userData || socket?.connected) return;
    const newSocket = io(backendUrl, {
      query: {
        userId: userData._id,
      }
    });
    newSocket.connect();
    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (userIds: string[]) => {
      setOnlineUsers(userIds);
    });
  }


  const value: AuthContextType = {
    axios,
    authUser,
    onlineUsers,
    socket,
    login,
    logout,
    updateProfile,
    checkAuth
  }

  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
