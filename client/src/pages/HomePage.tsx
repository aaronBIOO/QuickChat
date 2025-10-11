import { useState } from "react"
import ChatContainer from "@/components/ChatContainer"
import RightSidebar from "@/components/RightSidebar"
import Sidebar from "@/components/Sidebar"
import type { User } from "@/assets/assets"
import { useContext } from "react"
import { AuthContext } from "@/context/AuthContext"
import { Skeleton } from "@/components/ui/skeleton"

function HomePage() {

  const context = useContext(AuthContext);
  const authUser = context?.authUser;
  const loading = context?.loading;

  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black/50">
        <Skeleton className="h-[90%] w-[90%] rounded-2xl" />
      </div>
    )
 }
  
  if (!authUser) return null; 

  return (
    <div className="w-full h-screen sm:px-[8%] sm:py-[2%]">
      <div className={`
        backdrop-blur-xl sm:border-2 sm:border-gray-600 sm:rounded-2xl
        overflow-hidden h-[100%] grid relative
        ${selectedUser ? "md:grid-cols-[1fr_1.8fr_1fr] xl:grid-cols-[1fr_2.5fr_1fr]" : "md:grid-cols-2"}
        `}>
        <Sidebar />
        <ChatContainer />
        <RightSidebar 
          selectedUser={selectedUser} 
          setSelectedUser={setSelectedUser} 
        />
      </div>
    </div>
  )
}

export default HomePage;