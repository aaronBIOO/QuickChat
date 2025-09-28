import assets, { userDummyData } from "@/assets/assets"
import { useNavigate } from "react-router-dom"
import type { User } from "@/assets/assets"
import { useContext } from "react"
import { AuthContext } from "@/context/AuthContext"

interface SidebarProps {
  selectedUser: User | null
  setSelectedUser: (user: User | null) => void
}

function Sidebar({ selectedUser, setSelectedUser }: SidebarProps) {

  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('AuthContext is not available');
  }
  const { logout } = context;

  const navigate = useNavigate();

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
            className="
              flex-1 bg-transparent border-none outline-none 
              text-white text-sm placeholder-gray-400 
              "
          />
        </div>
      </div>
      
      {/* chat list */}
      <div className="flex flex-col gap-3">
        {
          userDummyData.map((user, index) => (
            <div 
              onClick={() => {
                setSelectedUser(selectedUser?._id === user._id ? null : user)
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
                {
                  index < 3
                  ? <span className="text-green-400 text-xs">Online</span>
                  : <span className="text-neutral-400 text-xs">Offline</span>
                }
              </div>
              
              {
                index > 2 
                && 
                <p className="
                  absolute top-4 right-4 text-xs w-5 h-5 flex justify-center 
                  items-center rounded-full bg-violet-500/50
                  ">
                  {index}
                </p>
              }
            </div>
          ))
        }
      </div>
    </div>
  )
}

export default Sidebar;
