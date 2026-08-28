import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import AdsDock from './AdsManager.jsx'
import { isSupabaseConfigured } from './lib/supabase.js'
import './styles.css'
import './phase2.css'

document.documentElement.dataset.backend = isSupabaseConfigured ? 'supabase' : 'demo'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <AdsDock />
  </React.StrictMode>,
)
