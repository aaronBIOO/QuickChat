import type { User as BaseUser } from "@/assets/assets"
import assets, { imagesDummyData } from "@/assets/assets"

interface User extends BaseUser {
  bio?: string;
}

interface RightSideProps {
  selectedUser: User | null
  setSelectedUser: (user: User | null) => void
}

function RightSidebar({ selectedUser }: RightSideProps) {
  return selectedUser && (
    <div className={`
      bg-[#8185B2]/10 w-full relative overflow-y-scroll text-white rounded-l-xl
      ${selectedUser ? "max-md:hidden" : ""}
      `}>
      <div className="pt-6 flex flex-col items-center gap-2 text-xs font-light mx-auto">
        <img 
          src={selectedUser?.profilePic || assets.avatar_icon} 
          alt="" 
          className="w-20 aspect-[1/1] rounded-full"
        />
        <h1 className="text-xl font-medium mx-auto flex items-center gap-2">
          <p className="w-2 h-2 rounded-full bg-green-500"></p>
          {selectedUser.fullName}
        </h1>
        <p className="px-10 mx-auto">{selectedUser.bio}</p>
      </div>

      <hr className="my-4 border-[#ffffff50]" />

      <div className="px-5 text-xs">
        <p>Media</p>
        <div className="mt-2 mb-2 max-h-[900px] overflow-y-scroll grid grid-cols-2 gap-3 opacity-80">
          {
            imagesDummyData.map((url, index) => (
              <div key={index} onClick={() => window.open(url)} className="cursor-pointer rounded">
                <img src={url} alt="" className="h-full rounded-sm" />
              </div>
            ))
          }
        </div>
      </div>
      <button className="
        absolute bottom-5 left-1/2 transform -translate-x-1/2
        bg-gradient-to-r from-purple-400 to-violet-600 
        text-white border-none text-sm font-light py-2 px-20 
        rounded-full cursor-pointer
      ">
        Logout
      </button>
    </div>
  )
}

export default RightSidebar;
