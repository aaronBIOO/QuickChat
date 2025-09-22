import assets from "@/assets/assets"
import { AuthContext } from "@/context/AuthContext"
import { useContext, useState } from "react"


function LoginPage() {
  
  const [currentState, setCurrentState] = useState("Sign up")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [bio, setBio] = useState("")
  const [isDataSubmitted, setIsDataSubmitted] = useState(false)

  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error('AuthContext is not available');
  }
  
  const { login } = authContext;

  const onSubmitHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (currentState === "Sign up" && !isDataSubmitted) {
      setIsDataSubmitted(true)
      return;
    }

    const authType = currentState === "Sign up" ? 'signup' : 'login';

    const credentials = authType === "signup"
      ? { email, password, fullName, bio }
      : { email, password }
    
    login(authType, credentials);
  }

  return (
    <div className="
      min-h-screen bg-cover bg-center flex flex-col sm:flex-row items-center 
      justify-center sm:justify-center sm:gap-50 p-4 backdrop-blur-2xl 
    ">
        {/* ----- left ----- */}
        <img src={assets.logo_big} 
          alt="" 
          className="w-full max-w-[150px] sm:max-w-[180px] mb-6 sm:mb-0 shadow-lg" 
        />
        
        {/* ----- right ----- */}
        <form 
          onSubmit={onSubmitHandler}
          className="
            border-2 bg-white/8 text-white border-gray-500 p-6 
            flex flex-col rounded-2xl shadow-lg gap-6 w-[350px]
          ">
          <h2 className="text-2xl font-medium flex justify-between items-center">
            {currentState}
            {isDataSubmitted && (
              <img 
                src={assets.arrow_icon} 
                alt="" 
                className="w-5 cursor-pointer" 
                onClick={() => setIsDataSubmitted(false)}
              />
            )}
          </h2>

          {currentState === "Sign up" && !isDataSubmitted && (
            <input 
              type="text" 
              placeholder="Full name" 
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="
                p-2 border border-gray-500 rounded-md focus:outline-none
                focus:ring-2 focus:ring-indigo-500
              " 
            />
          )}

          {!isDataSubmitted && (
              <>
                <input 
                  type="email" 
                  placeholder="Email address" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    p-2 border border-gray-500 rounded-md focus:outline-none
                    focus:ring-2 focus:ring-indigo-500
                  " 
                />
                <input 
                  type="password" 
                  placeholder="Password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  className="
                    p-2 border border-gray-500 rounded-md 
                    focus:outline-none focus:ring-2 focus:ring-indigo-500
                  " 
                />
              </>
            )
          }

          {currentState === "Sign up" && isDataSubmitted && (
              <textarea 
                rows={4}
                placeholder="provide short a bio..." 
                required
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="
                  p-2 border border-gray-500 rounded-md focus:outline-none
                  focus:ring-2 focus:ring-indigo-500 min-h-[30px] max-h-[80px]
                " 
              />
            )
          }

          <button className="
            py-3 bg-gradient-to-r from-purple-400 to-violet-600 
            text-white rounded-md cursor-pointer
            ">
            {currentState === "Sign up" ? "Create Account" : "Login Now"} 
          </button>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <input type="checkbox" />
            <p>Agree to terms of use & privacy policy</p>
          </div>

          <div className="flex flex-col gap-2">
            {currentState === "Sign up" ? (
                <p className="text-sm text-gray-600">
                  <span>Already have an account? {' '}</span>
                  <span 
                    onClick={() => { setCurrentState("Login"); setIsDataSubmitted(false); }} 
                    className="font-medium text-violet-500 cursor-pointer ml-1">
                    Login here
                  </span>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  <span>Don't have an account? {' '}</span>
                  <span 
                    onClick={() => { setCurrentState("Sign up") }} 
                    className="font-medium text-violet-500 cursor-pointer ml-1">
                    Sign up here
                  </span>
                </p>
              ) 
            }
          </div>
        </form>
    </div>
  )
}

export default LoginPage;