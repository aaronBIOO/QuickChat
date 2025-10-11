import { SignedIn, SignedOut } from "@clerk/react-router"; 
import { Skeleton } from "@/components/ui/skeleton";
import { Route, Routes, Navigate } from "react-router-dom"
import HomePage from "@/pages/HomePage"
import ProfilePage from "@/pages/ProfilePage"
import { Toaster } from "react-hot-toast"
import { AuthContext } from "@/context/AuthContext"
import LoginPage from "@/pages/LoginPage"
import { useContext } from "react"


function App() {

  const context = useContext(AuthContext);
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
    <div className="w-full h-screen bg-black bg-contain">
      <Toaster />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <SignedIn>
                <HomePage />
              </SignedIn>
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/profile"
          element={
            <>
              <SignedIn>
                <ProfilePage />
              </SignedIn>
              <SignedOut>
                <Navigate to="/login" replace />
              </SignedOut>
            </>
          }
        />

        <Route
          path="/login/*"
          element={
            <>
              <SignedOut>
                <LoginPage />
              </SignedOut>
              <SignedIn>
                <Navigate to="/" replace />
              </SignedIn>
            </>
          }
        />

        <Route
          path="*"
          element={
            <SignedOut>
              <Navigate to="/login" replace />
            </SignedOut>
          }
        />
      </Routes>
    </div>
  )
}

export default App;