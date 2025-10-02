import { Skeleton } from "@/components/ui/skeleton";
import { Route, Routes, Navigate } from "react-router-dom"
import HomePage from "@/app/HomePage"
import LoginPage from "@/app/LoginPage"
import ProfilePage from "@/app/ProfilePage"
import {Toaster} from "react-hot-toast"
import { AuthContext } from "@/context/AuthContext"
import { useContext } from "react"


function App() {

  const context = useContext(AuthContext);
  const authUser = context?.authUser;
  const loading = context?.loading;


  if (loading) {
    return (
      <div className="
      w-full h-screen flex gap-1 items-center 
      justify-center bg-black p-10
      ">
      <Skeleton className="h-[80%] w-[40%] rounded-lg" />
      <Skeleton className="h-[80%] w-[40%] rounded-lg" />
    </div>
    );
  }

  return (
    <div className="
      w-full h-screen
      bg-[url('./src/assets/bgImage.svg')] bg-contain
      ">
      <Toaster />
      <Routes>
        <Route 
          path="/" 
          element={authUser ? <HomePage /> : <Navigate to="/login" />} 
        />

        <Route 
          path="/login" 
          element={!authUser ? <LoginPage /> : <Navigate to="/" />} 
        />
        
        <Route 
          path="/profile" 
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />} 
        />
      </Routes>
    </div>
  )
}

export default App;