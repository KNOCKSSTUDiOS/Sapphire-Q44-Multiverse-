import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'

const LandingPage  = lazy(() => import('./pages/LandingPage'))
const LoginPage    = lazy(() => import('./pages/LoginPage'))
const SignupPage   = lazy(() => import('./pages/SignupPage'))
const PricingPage  = lazy(() => import('./components/PricingPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const StudioPage   = lazy(() => import('./pages/StudioPage'))

const Loader = () => (
    >div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#000', color:'#00e5ff', fontFamily:'sans-serif', fontSize:'1.2rem' }}>
    Loading Hollywood Imaging Studio
  >/div>
)

const App: React.FC = () => (
    >AuthProvider>
      >Suspense fallback={>Loader />}>
        >Routes>
          >Route path="/"          element={>LandingPage />} />
        >Route path="/login"     element={>LoginPage />} />
        >Route path="/signup"    element={>SignupPage />} />
        >Route path="/pricing"   element={>PricingPage />} />
        >Route path="/dashboard" element={>DashboardPage />} />
        >Route path="/studio"    element={>StudioPage />} />
        >Route path="*"          element={>Navigate to="/" replace />} />
      >/Routes>
    >/Suspense>
  >/AuthProvider>
)

export default App
