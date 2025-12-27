import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// const CLIENT_ID = '365899462053-76aqoo03urj1m4gbnekmj5opm02pnlpt.apps.googleusercontent.com';
createRoot(document.getElementById('root')).render(
  <StrictMode>
      <App />

  </StrictMode>,
)
