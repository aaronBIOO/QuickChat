import assets from "@/assets/assets"
import {SignIn} from "@clerk/clerk-react"

function LoginPage() {

  return (
    <div className="
      min-h-screen bg-cover bg-center flex flex-col sm:flex-row items-center 
      justify-center sm:justify-center sm:gap-50 p-4 backdrop-blur-2xl 
    ">
      {/* left */}
      <img src={assets.logo_big} 
        alt="" 
        className="w-full max-w-[150px] sm:max-w-[180px] mb-6 sm:mb-0 shadow-lg" 
      />
      
      {/* right */}
      <div className="w-[350px]">
        <SignIn 
          path="/login" 
          routing="path" 
          fallbackRedirectUrl="/" 

          // appearance
          appearance={{
            elements: {
              rootBox: "w-full",
              
              // Card
              card: `
                border-1 border-gray-500 p-6
                flex flex-col rounded-2xl shadow-lg gap-6
                bg-white/8 text-white/80
              `,

              headerTitle: "text-white text-2xl font-medium",
              headerSubtitle: "text-gray-400",
  
              // Input field
              formFieldInput: "bg-white/80",
              formFieldInputHover: "bg-white/80",
              formFieldInputFocus: "bg-white/80",

              // Buttons
              formButtonPrimary: `
               !bg-gradient-to-r !from-purple-400 !to-violet-600 
               !text-white !rounded-md !cursor-pointer 
               hover:!from-purple-500 hover:!to-violet-700
              `,
              
              // switch links
              footerActionText: 'text-gray-400',
              footerActionLink: '!text-violet-500 hover:!text-violet-400',
            },
          }}
        />
      </div>
    </div>
  )
}

export default LoginPage;