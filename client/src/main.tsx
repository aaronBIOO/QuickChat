import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext.tsx'
import { ChatContextProvider } from '@/context/ChatContextProvider.tsx'
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk publishable key");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <AuthProvider>
          <ChatContextProvider>
            <App />
          </ChatContextProvider>
        </AuthProvider>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
);
