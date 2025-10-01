import assets from "@/assets/assets"
import { useNavigate } from "react-router-dom"
import { useContext, useState } from "react"
import { AuthContext, type AuthContextType } from "@/context/AuthContext"
import { ChatContext } from "@/context/ChatContext"
import type { ChatContextType, User } from "@/types/chat.types"


function Sidebar() {

  const chatContext = useContext(ChatContext) as ChatContextType;
  const authContext = useContext(AuthContext) as AuthContextType;
  
  if (!chatContext || !authContext) {
    throw new Error('Context is not available');
  }

  const { 
    users, 
    selectedUser, 
    setSelectedUser,
    unseenMessage,
    setUnseenMessage,
  } = chatContext;
  console.log("Users from ChatContext:", users);
  
  const { logout, onlineUsers } = authContext;
  const [input, setInput] = useState<string>("");

  const navigate = useNavigate();

  const filteredUsers = input 
    ? users.filter((user: User) => {
      return user.fullName?.toLowerCase().includes(input.toLowerCase());
      }) 
    : users;
  
  return (
    <div className={`
      bg-[#8185B2]/10 h-full p-5 overflow-y-scroll text-white
      ${selectedUser ? "max-md:hidden rounded-r-xl" : ""}
      `}>
      {/* header: logo & menu bar */}
      <div className="pb-5">
        <div className="flex justify-between items-center">
          <img 
            src={assets.logo} 
            alt="logo" 
            className="max-w-40 color-gray-500" 
          />
          <div className="relative py-2 group">
            <img 
              src={assets.menu_icon} 
              alt="menu" 
              className="max-h-5 cursor-pointer" 
            />
            <div className="
              hidden group-hover:block absolute top-full right-0 z-20 w-32 p-5
              border border-gray-600 rounded-md bg-[#282142] text-gray-100 shadow-md
              ">
              <p 
                onClick={() => navigate('/profile')} 
                className="cursor-pointer text-sm hover:text-gray-500">
                Edit Profile
              </p>
              <hr className="my-2 border-gray-500" />
              <p 
                onClick={async () => {
                  try {
                    await logout();
                    navigate('/login');
                    } catch (error) {
                    console.error("Logout failed:", error);
                  }
                }} 
                className="cursor-pointer text-sm hover:text-red-500">
                Logout
              </p>
            </div>
          </div>
        </div>

        {/* search bar */}
        <div className="
          bg-[#282142] rounded-full flex items-center 
          gap-2 py-3 px-4 mt-5 shadow-md 
          ">
          <img 
            src={assets.search_icon} 
            alt="search" 
            className="w-3" 
          />
          <input 
            type="text" 
            placeholder="Search" 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            className="
              flex-1 bg-transparent border-none outline-none 
              text-white text-sm placeholder-gray-400 
              "
          />
        </div>
      </div>
      
      {/* chat list */}
      <div className="flex flex-col gap-3">
        {filteredUsers.map((user: User) => (
          <div 
            key={user._id}
            onClick={() => {
              setSelectedUser(user);
              setUnseenMessage(prev => ({
                ...prev,
                [user._id]: 0
              }));
            }}
            className={`
              relative flex items-center gap-3 p-2 pl-4
              rounded cursor-pointer max-sm:text-sm 
              ${selectedUser?._id === user._id && "bg-[#282142]/50"}
            `}>
            
            <img 
              src={user?.profilePic || assets.avatar_icon} 
              alt="user" 
              className="w-[35px] aspect-[1/1] rounded-full"
            />
            <div className="flex flex-col leading-5">
              <p>{user.fullName}</p>
              {onlineUsers.includes(user._id)
                ? <span className="text-green-400 text-xs">Online</span>
                : <span className="text-neutral-400 text-xs">Offline</span>
              }
            </div>
              
            {unseenMessage[user._id] && 
              <p className="
                absolute top-4 right-4 text-xs w-5 h-5 flex justify-center 
                items-center rounded-full bg-violet-500/50
                ">
                {unseenMessage[user._id]}
              </p>
            }
          </div>
          ))}
      </div>
    </div>
  )
}

export default Sidebar;
