import { useState } from "react"
import ChatContainer from "@/components/chatContainer"
import RightSidebar from "@/components/RightSidebar"
import Sidebar from "@/components/Sidebar"
import type { User } from "@/assets/assets"

function HomePage() {

  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  return (
    <div className="w-full h-screen sm:px-[8%] sm:py-[2%]">
      <div className={`
        backdrop-blur-xl sm:border-2 sm:border-gray-600 sm:rounded-2xl
        overflow-hidden h-[100%] grid relative
        ${selectedUser ? "md:grid-cols-[1fr_1.5fr_1fr] xl:grid-cols-[1fr_2fr_1fr]" : "md:grid-cols-2"}
        `}>
        <Sidebar 
          selectedUser={selectedUser} 
          setSelectedUser={setSelectedUser} 
        />
        <ChatContainer  
          selectedUser={selectedUser} 
          setSelectedUser={setSelectedUser} 
        />
        <RightSidebar 
          selectedUser={selectedUser} 
          setSelectedUser={setSelectedUser} 
        />
      </div>
    </div>
  )
}

export default HomePage