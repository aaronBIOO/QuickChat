import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import axios, { type AxiosError, type AxiosRequestConfig } from "axios";
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
  accessToken: string | null;
  login: (state: 'login' | 'signup', credentials: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (body: { fullName?: string; bio?: string; profilePic?: string }) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
axios.defaults.baseURL = backendUrl;
console.log("Backend URL being used:", backendUrl);
axios.defaults.withCredentials = true;

const AuthContext = createContext<AuthContextType | null>(null);
export { AuthContext };

export const AuthProvider = ({ children }: { children: ReactNode }) => {

  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null); 


  // automatic handling of expired access tokens with axios interpreter.
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      response => response,
      async (error: unknown) => {
        const axiosError = error as AxiosError;
        const originalRequest = axiosError.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

        // temporal for debugging
        if (axiosError.config?.url?.includes("/refresh-token")) {
          console.warn("Prevented infinite loop on refresh-token");
          return Promise.reject(error);
        }
        
        if (axiosError.response?.status === 401 && originalRequest && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const { data } = await axios.post("/api/auth/refresh-token");
            if (data.success) {
              setAccessToken(data.accessToken);
            
              if (authUser) {
                socket?.disconnect();
                connectSocket(authUser, data.accessToken);
              }

              return axios({
                ...originalRequest,
                headers: {
                  ...originalRequest.headers,
                  Authorization: `Bearer ${data.accessToken}`
                }
              });
            }
          } catch (refreshError) {
            await logout();
            toast.error("Session expired. Please login again.");
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);
    };
  }, [authUser]);


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
      const { data } = await axios.get("/api/auth/user/check");
      if (data.success) {
        setAuthUser(data.user);
        setAccessToken(data.accessToken);
        connectSocket(data.user, data.accessToken);
      } else {
        setAuthUser(null);
        setAccessToken(null);
      }
    } catch (error: unknown) {
      setAuthUser(null);
      setAccessToken(null);

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
      const { data } = await axios.post(`/api/auth/user/${state}`, credentials);
      if (data.success) {
        setAuthUser(data.user);
        setAccessToken(data.accessToken);
        connectSocket(data.user, data.accessToken);
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
      await axios.post('/api/auth/user/logout');
      setAuthUser(null);
      setAccessToken(null);
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
  }

  
  // connect socket 
  const connectSocket = (userData: AuthUser | null, accessToken: string | null) => {
    if (!userData || socket?.connected) return;

    const newSocket = io(backendUrl, {
      auth: { token: accessToken || "" },
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
  }


  const value: AuthContextType = {
    axios,
    authUser,
    onlineUsers,
    socket,
    loading,
    accessToken,
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
