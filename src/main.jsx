import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google';
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="369885088133-j9n7d76p6aukqljpb76fpsfu68bq76mj.apps.googleusercontent.com">
  <App />
</GoogleOAuthProvider>
,
)
