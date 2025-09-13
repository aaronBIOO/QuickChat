import { Route, Routes } from "react-router-dom"
import HomePage from "@/pages/HomePage"
import LoginPage from "@/pages/LoginPage"
import ProfilePage from "@/pages/ProfilePage"

export default function App() {
  return (
    <>
      <div className="
        w-full h-screen
        bg-[url('./src/assets/bgImage.svg')] bg-contain
        ">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
      </div>
    </>
  )
}
