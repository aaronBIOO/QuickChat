import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext.tsx'
import { ChatContextProvider } from '@/context/ChatContextProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ChatContextProvider>
          <App />
        </ChatContextProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
