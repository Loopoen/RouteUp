import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AppProvider } from './context/AppContext.tsx'

export const authServices = "http://localhost:5000"
export const restaurantService = "http://localhost:5001"

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId='341149613622-i5oh0nsp7dd6ucgfia8djirree4rk4vh.apps.googleusercontent.com'>
      <AppProvider>
           <App/>
      </AppProvider>
   
    </GoogleOAuthProvider>
  </StrictMode>,
)
