import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Splash from './pages/Splash'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import RouteFinder from './pages/RouteFinder'
import RouteDetails from './pages/RouteDetails'
import MapScreen from './pages/MapScreen'
import SOS from './pages/SOS'
import FakeCall from './pages/FakeCall'
import EmergencyContacts from './pages/EmergencyContacts'
import Profile from './pages/Profile'
import UserReport from './pages/UserReport'
import SafetyHeatmap from './pages/SafetyHeatmap'
import Chatbot from './pages/Chatbot'
import VoiceTrigger from './pages/VoiceTrigger'
import AdminDashboard from './pages/AdminDashboard'
import type { ReactNode } from 'react'

// Guard: redirect unauthenticated users to /login
function PrivateRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Guard: redirect already-authenticated users away from login/register
function PublicRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <>{children}</>
}

// Guard: admin-only pages
function AdminRoute({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public splash */}
      <Route path="/" element={<Splash />} />

      {/* Auth pages — redirect to dashboard if already logged in */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Protected pages inside Layout (with bottom nav) */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/route-finder" element={<RouteFinder />} />
        <Route path="/route-details" element={<RouteDetails />} />
        <Route path="/map" element={<MapScreen />} />
        <Route path="/sos" element={<SOS />} />
        <Route path="/fake-call" element={<FakeCall />} />
        <Route path="/emergency-contacts" element={<EmergencyContacts />} />
        <Route path="/voice-trigger" element={<VoiceTrigger />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/report" element={<UserReport />} />
        <Route path="/heatmap" element={<SafetyHeatmap />} />
        <Route path="/chatbot" element={<Chatbot />} />
        {/* Admin only */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      </Route>

      {/* Catch-all fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
