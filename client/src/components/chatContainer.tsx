import { formatMessageTime } from "@/lib/utils"
import { useEffect, useRef, useState } from "react"
import { useContext } from "react"
import { ChatContext } from "@/context/ChatContext"
import { AuthContext } from "@/context/AuthContext"
import { toast } from "react-hot-toast"
import assets from "@/assets/assets"
import { ArrowLeft, SendHorizonal } from "lucide-react"

function ChatContainer() {
  
  const chatContext = useContext(ChatContext);
  const authContext = useContext(AuthContext);
  const scrollEnd = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState("");

  
  if (!chatContext) {
    throw new Error('ChatContext must be used within a ChatProvider');
  }
  
  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }


  const { 
    messages, 
    selectedUser, 
    setSelectedUser, 
    sendMessage, 
    getMessages 
  } = chatContext;
  
  const { authUser, onlineUsers } = authContext;


  // get messages
  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    }
  }, [selectedUser]);


  // scroll to bottom upon new message addition
  useEffect(() => {
    if (scrollEnd.current && messages) {
      scrollEnd.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);


  // send message
  const handleSendMessage = async (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    e.preventDefault();
    if (input.trim() === "") return null;
    await sendMessage({text: input.trim()});
    setInput("");
  }


  // send image
  const handleSendImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    };
    
    const reader = new FileReader();
    
    reader.onload = async () => {
      await sendMessage({image: reader.result as string});
      e.target.value = "";
    };
    reader.readAsDataURL(file);
  }


  return selectedUser ? (
    <div className="
    h-full overflow-scroll relative backdrop-blur-lg 
    bg-black md:border-l-1 md:border-stone-500/10
    ">
      {/* header */}
      <div className="flex items-center gap-3 py-3 mx-4 border-b border-stone-500/10">
        <ArrowLeft 
          className="md:hidden max-w-7 cursor-pointer text-white/40"
          onClick={() => setSelectedUser(null)}
        />
        <img 
          src={selectedUser.profilePic || assets.avatar_icon} 
          alt="" 
          className="w-8 rounded-full" 
        />
        <p className="flex-1 text-lg text-white flex items-center gap-2">
          {selectedUser.fullName}
          {onlineUsers.includes(selectedUser._id) 
            ? <span className="w-2 h-2 rounded-full bg-green-500"></span> 
            : <span className="w-2 h-2 rounded-full bg-gray-500"></span>
          }
        </p>
        <img 
          src={assets.help_icon}
          alt=""
          className="max-md:hidden max-w-5"
        />
      </div>


      {/* text exchange area */}
      <div className="flex flex-col h-[calc(100%-130px)] overflow-y-scroll p-4 bg-gray-100/4">
        {messages.map((msg, index) => (
          <div 
            key={index}
            className={`
              flex item-end gap-2 justify-end 
              ${msg.senderId !== authUser?._id && "flex-row-reverse"}
            `}>
              {msg.image ?
              (<img 
                src={msg.image} 
                alt="" 
                className="
                  max-w-[230px] border-5 border-blue-500 rounded-lg
                  overflow-hidden mb-8
                " 
                />) : (
                <p className={`
                  p-3 max-w-[230px] md:text-sm font-light 
                  rounded-2xl mb-8 break-all bg-blue-500/50 text-white
                  ${msg.senderId === authUser?._id 
                    ? "bg-blue-500/50 rounded-br-none" 
                    : "bg-gray-700/50 rounded-bl-none"
                  }
                  `}>
                  {msg.text}
                  <span className={`
                    block text-xs text-gray-500 text-right pt-0.5 
                    ${msg.senderId === authUser?._id ? "text-left" : "text-right"}`}>
                    {formatMessageTime(msg.createdAt)}
                  </span>
                </p>
              )}
          </div>
          ))}
        <div ref={scrollEnd}></div>
      </div>
      

      {/* text input area */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3 pl-5 pb-5">
        <div className="flex-1 flex items-center bg-gray-100/12 px-3 rounded-full">
          <input 
            type="text" 
            placeholder="Send a message" 
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
            value={input}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => { 
              if (e.key === "Enter") {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
            className="
              flex-1 text-sm p-3 border-none rounded-lg outline-none 
              text-white placeholder-gray-400
            "
          />
          <input 
            type="file" 
            id="image" 
            accept="image/png, image/jpeg" 
            hidden 
            onChange={handleSendImage}
          />
          <label htmlFor="image">
            <img 
              src={assets.gallery_icon} 
              alt="" 
              className="w-5 mr-2 cursor-pointer" 
            />
          </label>
        </div>
        <div className="flex items-center w-10 h-10 rounded-full cursor-pointer bg-gray-100/12 p-2">
          <SendHorizonal 
            onClick={handleSendMessage} 
            className={`w-8 cursor-pointer text-blue-500/50 ${input.trim() ? "text-blue-500/50" : "text-gray-600"}`}
            strokeWidth={2.5}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className="
      flex flex-col items-center justify-center gap-2 text-gray-500
      bg-gray-100/4  max-md:hidden
      ">
      <img 
        src={assets.logo_icon} 
        alt="" 
        className="max-w-40" 
      />
      <p className="text-lg font-medium text-white">
        Chat anytime, anywhere
      </p>
    </div>
  );
}

export default ChatContainer;
