import { Route, Routes, Navigate } from "react-router-dom"
import HomePage from "@/pages/HomePage"
import LoginPage from "@/pages/LoginPage"
import ProfilePage from "@/pages/ProfilePage"
import {Toaster} from "react-hot-toast"
import { AuthContext } from "@/context/AuthContext"
import { useContext } from "react"


function App() {

  const context = useContext(AuthContext);
  const authUser = context?.authUser;

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