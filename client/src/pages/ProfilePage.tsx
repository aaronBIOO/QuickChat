
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import assets from "@/assets/assets"

function ProfilePage() {

  const [selectedImg, setSelectedImg] = useState<File | null>(null)
  const [name, setName] = useState("Martin Johnson")
  const [bio, setBio] = useState("Hi Everyone, I am using QuickChat")

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigate("/");
  }
  
  return (
    <div className="min-h-screen bg-cover bg-no-repeat flex items-center justify-center ">
      <div className="
        w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 
        flex items-center justify-center max-sm:flex-col-reverse rounded-lg
        md:w-[50%]
      ">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-10 flex-1">
        <h3 className="text-lg">Profile details</h3>
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
          upload profile image
        </label>
        <input 
          type="text" 
          placeholder="Full name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          className="
            p-2 border border-gray-600 rounded-md 
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
            p-2 border border-gray-600 rounded-md focus:outline-none
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
      <img 
        src={assets.logo_icon} 
        alt="" 
        className="
          max-w-40 aspect-square rounded-2xl mx-10 max-sm:mt-10 
          hidden md:block
        " 
      />
      </div>
    </div>
  )
}

export default ProfilePage