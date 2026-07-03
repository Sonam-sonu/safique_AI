import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'

const NAV_TABS = [
  { path: '/dashboard', label: 'Home',    icon: '🏠' },
  { path: '/map',       label: 'Map',     icon: '🗺️' },
  { path: '/sos',       label: 'SOS',     icon: '🆘', isSOS: true },
  { path: '/heatmap',   label: 'Safety',  icon: '🔥' },
  { path: '/profile',   label: 'Profile', icon: '👤' },
]

// Pages where bottom nav should be hidden (full-screen experiences)
const HIDE_NAV: string[] = []

function BottomNav() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  if (HIDE_NAV.includes(pathname)) return null

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-inner">
        {NAV_TABS.map(tab => {
          if (tab.isSOS) {
            return (
              <motion.button
                key="sos"
                className="bottom-nav-sos"
                whileTap={{ scale: 0.91 }}
                onClick={() => navigate('/sos')}
                aria-label="Emergency SOS"
              >
                <span style={{ fontSize: 18, color: 'white', lineHeight: 1 }}>🆘</span>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.85)', fontWeight: 900, letterSpacing: '0.08em', marginTop: 1 }}>SOS</span>
              </motion.button>
            )
          }
          const active = pathname === tab.path
          return (
            <motion.button
              key={tab.path}
              className={`bottom-nav-btn${active ? ' active' : ''}`}
              whileTap={{ scale: 0.88 }}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
            >
              {/* Active indicator dot */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="nav-active"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    style={{
                      position: 'absolute', top: 6, width: 20, height: 2,
                      borderRadius: 999, background: 'linear-gradient(90deg, #7C6FFF, #FF4D8D)',
                      boxShadow: '0 0 8px rgba(124,111,255,0.8)',
                    }}
                  />
                )}
              </AnimatePresence>
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </motion.button>
          )
        })}
      </div>
    </nav>
  )
}

export default function Layout() {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
