import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.jsx'
import {AdminProvider} from './context/AdminContext.jsx'
import {useQuery, QueryClient, QueryClientProvider} from '@tanstack/react-query'

const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
)