import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Navbar from './components/Navbar'

// Dismiss the HTML splash screen once React has painted
function useSplash() {
  useEffect(() => {
    const splash = document.getElementById('app-splash')
    if (!splash) return
    // Small delay so the first real frame renders before we fade out
    const timer = setTimeout(() => splash.classList.add('splash-hide'), 300)
    return () => clearTimeout(timer)
  }, [])
}

import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import SkillsPage from './pages/SkillsPage'
import SkillDetailPage from './pages/SkillDetailPage'
import ProfilePage from './pages/ProfilePage'
import SwapsPage from './pages/SwapsPage'
import MessagesPage from './pages/MessagesPage'
import NotificationsPage from './pages/NotificationsPage'
import SettingsPage from './pages/SettingsPage'
import AdminPage from './pages/AdminPage'

// Guest only (redirect logged in users)
function GuestRoute({ children }) {
  const { user } = useAuth()
  if (!user) return children
  return user.role === 'admin' ? <Navigate to="/admin" replace /> : <Navigate to="/dashboard" replace />
}

// Protected route wrapper (for regular users)
function PrivateRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  return children
}

// Admin route wrapper
function AdminRoute({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

import SkillSwapLoader from './components/SkillSwapLoader'

function AppRoutes() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <SkillSwapLoader />
  }

  // Define routes that should NOT show the top navigation bar (professional dashboard style)
  const dashboardRoutes = ['/dashboard', '/admin', '/messages', '/swaps', '/notifications', '/settings']
  const isDashboardLayout = (user && (location.pathname.startsWith('/profile') || location.pathname.startsWith('/skills'))) || dashboardRoutes.some(path => location.pathname.startsWith(path))

  return (
    <>
      {!isDashboardLayout && <Navbar />}
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/skills" element={<SkillsPage />} />
        <Route path="/skills/:id" element={<SkillDetailPage />} />
        <Route path="/profile/:id" element={<ProfilePage />} />

        {/* Guest only */}
        <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        {/* Protected */}
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/swaps" element={<PrivateRoute><SwapsPage /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><MessagesPage /></PrivateRoute>} />
        <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><SettingsPage /></PrivateRoute>} />

        {/* Admin */}
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
            <div style={{ fontSize: '6rem', marginBottom: 16 }}>404</div>
            <h2 style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Page not found</h2>
            <a href="/"><button className="btn btn-primary">Go Home</button></a>
          </div>
        } />
      </Routes>
    </>
  )
}

export default function App() {
  useSplash()
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--bg-card)',
                color: 'var(--text-main)',
                border: '1px solid var(--glass-border)',
                borderRadius: '12px',
                fontSize: '0.9rem',
                fontFamily: 'Inter, sans-serif',
              },
              success: { iconTheme: { primary: 'var(--success)', secondary: 'var(--bg-card)' } },
              error: { iconTheme: { primary: 'var(--error)', secondary: 'var(--bg-card)' } },
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
