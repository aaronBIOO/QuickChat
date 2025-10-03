
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import assets from "@/assets/assets"
import { useContext } from "react"
import { AuthContext } from "@/context/AuthContext"

function ProfilePage() {

  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('AuthContext is not available');
  }
  const { authUser, updateProfile } = context;

  const [selectedImg, setSelectedImg] = useState<File | null>(null)
  const [name, setName] = useState(authUser?.fullName || "")
  const [bio, setBio] = useState(authUser?.bio || "")

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedImg) {
      await updateProfile({ fullName: name, bio });
      navigate("/");
      return;
    }
  }

  if (selectedImg) {
    const reader = new FileReader();
    reader.readAsDataURL(selectedImg);
    reader.onload = async () => {
      const base64Image = reader.result as string;
      await updateProfile({ fullName: name, bio, profilePic: base64Image });
      navigate("/");
    }
  }
  
  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center w-full">
      <div className="
        w-5/6 backdrop-blur-2xl text-gray-300 border-2 border-gray-600 
        flex items-center justify-center rounded-lg
        md:w-[30%] p-0
      ">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-4 w-full">
        <h2 className="text-xl">Profile</h2>
        <label htmlFor="avatar" className="flex item-center gap-3 cursor-pointer">
          <input 
            type="file" 
            id="avatar" 
            accept=".png, .jpg, .jpeg" 
            hidden 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              if (e.target.files && e.target.files[0]) {
                setSelectedImg(e.target.files[0])
              }
            }}
          />
          <img 
            src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} 
            alt="" 
            className={`w-12 h-12 ${selectedImg && "rounded-full"}`} 
          />
        </label>
        <input 
          type="text" 
          placeholder="Full name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="
            p-2 border border-gray-600 rounded-md text-white/50
            focus:outline-none focus:ring-2 focus:ring-indigo-500
          "
        />
        <textarea
          rows={4}
          placeholder="Write profile bio..." 
          required
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="
            p-2 border border-gray-600 rounded-md focus:outline-none text-white/50
            focus:ring-2 focus:ring-indigo-500 min-h-[30px] max-h-[80px]
          " 
        />

        <button className="
          py-3 bg-gradient-to-r from-purple-400 to-violet-600 
          text-white rounded-full cursor-pointer
        ">
          Save Changes
        </button>
      </form>
      </div>
    </div>
  )
}

export default ProfilePage;