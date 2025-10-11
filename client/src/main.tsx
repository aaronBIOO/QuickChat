import { StrictMode } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from "@clerk/react-router";
import LoginPage from './pages/LoginPage.tsx';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk publishable key");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/login/*" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
);
